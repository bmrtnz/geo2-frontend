import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import { ModificationListComponent} from 'app/shared/components/modification-list/modification-list.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { BasesPaiementService } from 'app/shared/services/api/bases-paiement.service';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { CertificationsService } from 'app/shared/services/api/certification.service';
import { ConditionsVenteService } from 'app/shared/services/api/conditions-vente.service';
import { CourtierService } from 'app/shared/services/api/courtiers.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { GroupesClientService } from 'app/shared/services/api/groupes-vente.service';
import { HistoryType } from 'app/shared/services/api/historique.service';
import { IncotermsService } from 'app/shared/services/api/incoterms.service';
import { MoyensPaiementService } from 'app/shared/services/api/moyens-paiement.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { TypesClientService } from 'app/shared/services/api/types-client.service';
import { TypesVenteService } from 'app/shared/services/api/types-vente.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxAccordionComponent, DxCheckBoxComponent, DxNumberBoxComponent, DxTextBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { environment } from 'environments/environment';
import { from, of } from 'rxjs';
import { concatAll, mergeAll, switchMap, tap } from 'rxjs/operators';
import { reduceEachTrailingCommentRange } from 'typescript';
import { Certification, CertificationClient, Client, Role } from '../../../../shared/models';
import { AuthService, ClientsService } from '../../../../shared/services';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  private requiredFields = ['soumisCtifl'];

  preSaisie: string;

  formGroup = this.fb.group({
    code: [''],
    raisonSocial: [''],
    societe: [''],
    secteur: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    codePostal: [''],
    ville: [''],
    pays: [''],
    facturationRaisonSocial: [''],
    facturationAdresse1: [''],
    facturationAdresse2: [''],
    facturationAdresse3: [''],
    facturationCodePostal: [''],
    facturationVille: [''],
    facturationPays: [''],
    regimeTva: [''],
    incoterm: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    moyenPaiement: [''],
    tvaCee: [''],
    controlReferenceClient: [''],
    commentaireHautFacture: [''],
    commentaireBasFacture: [''],
    instructionCommercial: [''],
    siret: [''],
    blocageAvoirEdi: [''],
    ifco: [''],
    instructionLogistique: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    enCoursTemporaire: [''],
    enCoursBlueWhale: [''],
    fraisMarketing: [''],
    fraisPlateforme: [''],
    fraisExcluArticlePasOrigineFrance: [''],
    tauxRemiseParFacture: [''],
    tauxRemiseHorsFacture: [''],
    commercial: [''],
    assistante: [''],
    referenceCoface: [''],
    agrement: [''],
    courtageModeCalcul: [''],
    courtageValeur: [''],
    conditionVente: [''],
    typeClient: [''],
    typeVente: [''],
    groupeClient: [''],
    paloxRaisonSocial: [''],
    paloxGratuit: [''],
    consignePalox: [''],
    releveFactures: [''],
    identifiantFiscal: [''],
    courtier: [''],
    soumisCtifl: [''],
    valide: [false],
    lieuFonctionEan: [''],
    delaiBonFacturer: [''],
    debloquerEnvoieJour: [''],
    clotureAutomatique: [''],
    fraisRamasse: [''],
    refusCoface: [''],
    enCoursDateLimite: [''],
    certifications: [''],
    fraisMarketingModeCalcul: [''],
    formatDluo: [''],
    dateDebutIfco: [''],
    nbJourLimiteLitige: [''],
    detailAutomatique: [''],
    venteACommission: ['']
  });
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChild(DxCheckBoxComponent, { static: true }) validComponent: DxCheckBoxComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild('couvertureTotale', { static: false }) couvertureTotale: DxNumberBoxComponent;

  @ViewChild(PushHistoryPopupComponent, { static: false })
  validatePopup: PushHistoryPopupComponent;
  editing = false;


  client: Client;
  code: string;
  gridBoxValue: number[];
  secteurs: DataSource;
  paloxRaisonSocial: DataSource;
  commercial: DataSource;
  tempData: DataSource;
  assistante: DataSource;
  pays: DataSource;
  paysFacturation: DataSource;
  langue: DataSource;
  typesClient: DataSource;
  incoterms: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  basesTarif: DataSource;
  typesVente: DataSource;
  groupesClient: DataSource;
  courtiers: DataSource;
  regimesTva: DataSource;
  defaultVisible: boolean;
  conditionsVente: DataSource;
  certifications: DataSource;
  isReadOnlyMode = true;
  createMode = false;
  cofaceBlocked = false;
  tvaCeeFree = false;
  CCexists = false;
  ifcoChecked = false;
  couvTemp = false;

  constructor(
    private fb: FormBuilder,
    private basesPaiementService: BasesPaiementService,
    private clientsService: ClientsService,
    private devisesService: DevisesService,
    private incotermsService: IncotermsService,
    private paysService: PaysService,
    private secteursService: SecteursService,
    private personnesService: PersonnesService,
    private regimesTvaService: RegimesTvaService,
    private typesClientService: TypesClientService,
    private typesVenteService: TypesVenteService,
    private courtiersService: CourtierService,
    private basesTarifService: BasesTarifService,
    private groupesClientService: GroupesClientService,
    private certificationsService: CertificationsService,
    private moyensPaiementService: MoyensPaiementService,
    private conditionsVenteService: ConditionsVenteService,
    private router: Router,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
  ) {
    this.defaultVisible = false;
    this.checkCode = this.checkCode.bind(this);
  }

  get readOnlyMode() {
    return this.isReadOnlyMode;
  }
  set readOnlyMode(value: boolean) {
    this.editing = !value;
    this.isReadOnlyMode = value;
  }

  ngAfterViewInit(): void {
    // Ouverture ou fermeture accordéons (création)
    this.openCloseAccordions(this.createMode);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {

    this.route.params
      .pipe(tap(_ => this.formGroup.reset()))
      .subscribe(params => {
        const url = this.route.snapshot.url;
        this.createMode = url[url.length - 1].path === 'create';
        this.readOnlyMode = !this.createMode;
        if (!this.createMode) {
          this.clientsService.getOne(params.id)
            .subscribe(res => {
              this.client = res.data.client;
              this.freeUEVAT(this.client.secteur, this.client.pays);
              const certifications = this.mapCertificationsForDisplay(this.client.certifications);
              this.formGroup.patchValue({ ...this.client, certifications });
              this.preSaisie = this.client.preSaisie === true ? 'preSaisie' : '';
            });
        } else {
          // Apply default value
          this.client = new Client({
            soumisCtifl: false,
            delaiBonFacturer: 8 // Donné par Léa 7-09-2020
          });
          this.formGroup.patchValue(this.client);
          // Set current username if commercial
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([
            ['valide', '=', true], 'and', ['role', '=', Role.COMMERCIAL],
             'and',['nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur]
            ]);
          this.tempData.load().then((res) => {
            if (res.length) this.formGroup.get('commercial').setValue(res[0].id);
          });
          // Set current username if assistant(e)
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([['valide', '=', true], 'and', ['role', '=', Role.ASSISTANT],
           'and',['nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur]
          ]);
          this.tempData.load().then((res) => {
            if (res.length) this.formGroup.get('assistante').setValue(res[0].id);
          });
          // Set condit vente
          this.formGroup.get('conditionVente').setValue('COFREU');
        }
        this.contentReadyEvent.emit();
      });

    // Load different fields
    this.secteurs = this.secteursService.getDataSource();
    this.commercial = this.personnesService.getDataSource();
    this.commercial.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL],
      'and',
      ['nomUtilisateur', '<>', 'null']
    ]);
    this.assistante = this.personnesService.getDataSource();
    this.assistante.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.ASSISTANT],
      'and',
      ['nomUtilisateur', '<>', 'null']
    ]);

    this.pays = this.paysService.getDataSource();
    this.pays.filter(['valide', '=', 'true']);
    this.secteurs.filter([
      ['valide', '=', true],
      'and',
      ['societes', 'contains', this.currentCompanyService.getCompany().id]
    ])
    this.typesClient = this.typesClientService.getDataSource();
    this.incoterms = this.incotermsService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.typesVente = this.typesVenteService.getDataSource();
    this.groupesClient = this.groupesClientService.getDataSource();
    this.courtiers = this.courtiersService.getDataSource();
    this.basesTarif = this.basesTarifService.getDataSource();
    this.conditionsVente = this.conditionsVenteService.getDataSource();
    this.certifications = this.certificationsService.getDataSource();
    this.paloxRaisonSocial = this.clientsService.getDataSource_v2(['id', 'raisonSocial']);
    this.paloxRaisonSocial.filter(['secteur.id', '=', 'PAL']);

  }

  checkCode(params) {

    const code = params.value;
    const clientsSource = this.clientsService.getDataSource_v2(['code']);
    clientsSource.searchExpr('code');
    clientsSource.searchOperation('=');
    clientsSource.searchValue(code);
    return clientsSource.load().then(res => !(res.length));

  }

  checkCompteComptable(e) {
    const compteComptable = e.value;
    if (!compteComptable) return;
    const clientsSource = this.clientsService.getDataSource_v2(['compteComptable']);
    clientsSource.filter(['compteComptable', '=', compteComptable]);
    clientsSource.load().then(res => res.length ? this.CCexists = true : this.CCexists = false);
  }

  onIfcoChange(params) {
    this.ifcoChecked = params.value;
  }

  displayIDBefore(data) {
    return data ?
    (data.id + ' ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description)))
     : null;
  }

  onRefusCofaceChange(e) {
    const cofaceBlocked = (e.value === true);
    this.cofaceBlocked = cofaceBlocked;
    if (cofaceBlocked) {
      this.formGroup.get('agrement').setValue(0);
      this.formGroup.get('enCoursTemporaire').setValue(0);
    }
  }

  onCofaceChange(params, el?) {
    // Sum of couverture Coface & couverture BW. & couverture temporaire Updated on any change
    this.couvertureTotale.value = parseInt(this.formGroup.get('agrement').value || 0) + parseInt(this.formGroup.get('enCoursBlueWhale').value || 0) + parseInt(this.formGroup.get('enCoursTemporaire').value || 0);
    // If couverture temporaire, date limite is required
    if (el) {
      this.couvTemp = params.value;
    }
  }

  onCodeChange(e) {
    if (!e.value) return;
    const code = e.value.toUpperCase();
    this.formGroup.get('code').setValue(code);
    if (code.length && this.createMode) {
      this.formGroup.get('compteComptable').markAsDirty()
      this.formGroup.get('compteComptable').setValue(code);
    }
  }

  openCloseAccordions(action) {
    if (!this.accordion) return;
    this.accordion.toArray().forEach(element => {
      if (action) {
        element.instance.expandItem(0);
      } else {
        element.instance.collapseItem(0);
      }
    });
  }


  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const client = this.clientsService.extractDirty(this.formGroup.controls);

      if (!this.createMode) {
        client.id = this.client.id;
        if (client.valide === true) {
          client.preSaisie = false;
          this.preSaisie = '';
        }
      } else {
        for (const f of this.requiredFields) {
          client[f] = this.formGroup.controls[f].value;
        }
        // On spécifie l'ID de la société pour passer l'étape de création
        client.societe = { id: this.currentCompanyService.getCompany().id };
        client.code = this.formGroup.get('code').value.toUpperCase();
        client.valide = false;
        client.preSaisie = true;
      }

      const certifications = this.mapCertificationsForSave(client.certifications);

      (client.valide !== undefined && this.client.valide !== client.valide && !this.createMode ?
        this.validatePopup.present(
          HistoryType.CLIENT,
          { client: { id: client.id }, valide: client.valide },
        ) : of(undefined))
        .pipe(
          switchMap(_ => this.clientsService.save({
            client: {
              ...client,
              certifications,
            }
          })),
        )
        .subscribe({
          next: (e) => {
            notify('Sauvegardé', 'success', 3000);
            this.refreshGrid.emit();
            if (!this.createMode) {
              this.client = {
                ...this.client,
                ...this.formGroup.getRawValue(),
              };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/tiers/clients/${e.data.saveClient.id}`]);
            }
            this.client.historique = e.data.saveClient.historique;
            this.client.typeTiers = e.data.saveClient.typeTiers;
            this.client.certifications = e.data.saveClient.certifications;
            this.formGroup.markAsPristine();
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
    }
  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.client);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/clients`]);
    }
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  onSecteurChange(e) {
    // France => Echéance 30 J (et non modifiable voir html)
    if (this.editing) {
      if (e.value.id === 'F') {
        this.formGroup.get('nbJourEcheance').setValue(30);
      } else {
        this.formGroup.get('nbJourEcheance').reset();
      }
    }
    this.freeUEVAT(e.value, this.formGroup.get('pays').value);
  }

  onPaysChange(e) {
    this.freeUEVAT(this.formGroup.get('secteur').value, e.value);
  }

  freeUEVAT(sector, pays) {
    if (!sector || !pays) return;
    // ID TVA CEE : doit être obligatoire pour tous les secteurs sauf MAR / AFA / GB et DIV 
    // (+ obligatoire si pays = Irlande) - Léa 10/09/2021
    const sectors = ['MAR', 'AFA', 'GB', 'DIV'];
    this.tvaCeeFree = (sectors.includes(sector.id) && pays.id != 'IE');
  }

  onCourtierChange(e) {
    // Si pas de courtier, on supprime les infos connexes de courtage
    if (this.editing) {
      if (e.value === null) {
        this.formGroup.get('courtageModeCalcul').reset();
        this.formGroup.get('courtageValeur').reset();
      }
    }
  }

  entrepotsBtnClick() {
    console.log(this.client.id)
    this.router.navigateByUrl(`/nested/n/tiers/clients/${this.client.id}/entrepots/list`);
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${this.client.code}/${this.client.typeTiers}`]);
  }

  private mapCertificationsForDisplay(certifications: CertificationClient[]): Certification[] {
    if (!certifications || !certifications.length) return [];
    return certifications.map(({ certification }) => certification);
  }

  private mapCertificationsForSave(certifications: Certification[]): CertificationClient[] {
    if (!certifications || !certifications.length) return [];

    return certifications
      .map(({ id }) => {
        const cc = this.client.certifications && this.client.certifications.find(({ certification }) => certification.id === id);
        return {
          id: cc ? cc.id : null,
          certification: { id },
        };
      });
  }

}
