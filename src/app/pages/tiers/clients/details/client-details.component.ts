import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { ModificationListComponent } from 'app/shared/components/modification-list/modification-list.component';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import { InfoPopupComponent } from 'app/shared/components/info-popup/info-popup.component';
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
import { ModificationsService } from 'app/shared/services/api/modification.service';
import { MoyensPaiementService } from 'app/shared/services/api/moyens-paiement.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { SecteursService } from 'app/shared/services/api/secteurs.service';
import { TypesClientService } from 'app/shared/services/api/types-client.service';
import { TypesVenteService } from 'app/shared/services/api/types-vente.service';
import { ValidationService } from 'app/shared/services/api/validation.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { DxAccordionComponent, DxCheckBoxComponent, DxNumberBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Certification, CertificationClient, Client, Role } from '../../../../shared/models';
import { AuthService, ClientsService } from '../../../../shared/services';
import { client as clientsGridConfig } from 'assets/configurations/grids.json';
import { FormUtilsService } from 'app/shared/services/form-utils.service';

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
  @ViewChild(ModificationListComponent, { static: false }) modifListe: ModificationListComponent;
  @ViewChild(InfoPopupComponent, { static: true }) infoComponent: InfoPopupComponent;

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
  modifications: DataSource;
  isReadOnlyMode = true;
  createMode = false;
  cofaceBlocked = false;
  tvaCeeFree = false;
  CCexists = false;
  ifcoChecked = false;
  couvTemp = false;
  initialFormState: any;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private basesPaiementService: BasesPaiementService,
    private clientsService: ClientsService,
    private devisesService: DevisesService,
    private incotermsService: IncotermsService,
    private paysService: PaysService,
    private modificationsService: ModificationsService,
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
    public validationService: ValidationService,
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
              this.formGroup.get('tvaCee').markAsUntouched(); // Changing 'required' property marks as touched
              const certifications = this.mapCertificationsForDisplay(this.client.certifications);
              this.formGroup.patchValue({ ...this.client, certifications });
              this.initialFormState = this.formGroup.value; // Saving initial formGroup
              this.preSaisie = this.client.preSaisie === true ? 'preSaisie' : '';
            });
        } else {
          // Apply default value
          this.client = new Client({
            soumisCtifl: false,
            delaiBonFacturer: 8 // Donné par Léa 7-09-2020
          });
          this.formGroup.patchValue(this.client);
          this.formGroup.get('delaiBonFacturer').markAsDirty();
          // Set current username if commercial
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([
            ['valide', '=', true], 'and', ['role', '=', Role.COMMERCIAL],
             'and', ['nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur]
            ]);
          this.tempData.load().then((res) => {
            if (res.length) {
              this.formGroup.get('commercial').setValue({id : res[0].id});
              this.formGroup.get('commercial').markAsDirty();
            }
          });
          // Set current username if assistant(e)
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([['valide', '=', true], 'and', ['role', '=', Role.ASSISTANT],
           'and', ['nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur]
          ]);
          this.tempData.load().then((res) => {
            if (res.length) {
              this.formGroup.get('assistante').setValue({id : res[0].id});
              this.formGroup.get('assistante').markAsDirty();
            }
          });
          // Set condit vente
          this.formGroup.get('conditionVente').setValue({id: 'COFREU'});
          this.formGroup.get('conditionVente').markAsDirty();
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
    ]);
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

    this.client.id = this.client.id;
    const code = params.value;
    const clientsSource = this.clientsService.getDataSource_v2(['code']);
    clientsSource.searchExpr('code');
    clientsSource.searchOperation('=');
    clientsSource.searchValue(code);
    return clientsSource.load().then(res => !(res.length));

  }

  checkCompteComptable(e) {
    const compteComptable = this.valueToUpperCase(e);
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
      this.formGroup.get('agrement').markAsDirty();
      this.formGroup.get('enCoursTemporaire').setValue(0);
      this.formGroup.get('enCoursTemporaire').markAsDirty();
    }
  }

  onCofaceChange(params, el?) {
    // Sum of couverture Coface & couverture BW. & couverture temporaire Updated on any change
    this.couvertureTotale.value = parseInt(this.formGroup.get('agrement').value || 0, 10) +
    + parseInt(this.formGroup.get('enCoursBlueWhale').value || 0, 10)
    + parseInt(this.formGroup.get('enCoursTemporaire').value || 0, 10);
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
      this.formGroup.get('compteComptable').markAsDirty();
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

  checkEmptyModificationList(listLength) {
    if (listLength === 0 && this.authService.currentUser.adminClient) {
      const client = {id : this.client.id, preSaisie: false, valide: true};
      this.clientsService.save_v2(['id', 'preSaisie', 'valide'], {
        client,
      })
      .subscribe({
        next: () => {
          this.refreshGrid.emit();
          this.formGroup.get('valide').setValue(true);
          this.formGroup.markAsPristine();
          this.preSaisie = '';
          this.validationService.showToValidateBadges();
        },
        error: (err) => {
          console.log(err);
          notify('Echec de la sauvegarde', 'error', 3000);
        }
      });
    }
  }

  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      let client = this.formUtils.extractDirty(this.formGroup.controls, Client.getKeyField());

      if (this.createMode) {
        for (const f of this.requiredFields) {
          client[f] = this.formGroup.controls[f].value;
        }
        // On spécifie l'ID de la société pour passer l'étape de création
        client.societe = { id: this.currentCompanyService.getCompany().id };
        client.valide = false;
        client.preSaisie = true;

        if (!this.authService.currentUser.adminClient) {
          this.infoComponent.visible = true;
          this.infoComponent.doNavigate.subscribe(res => {
            if (res) {
              // On spécifie l'ID de la société pour passer l'étape de création
              client.societe = { id: this.currentCompanyService.getCompany().id };
              client.valide = false;
              client.preSaisie = true;
              this.saveData(client);
            }
          });
        } else {
          this.saveData(client);
        }

      } else {
        client.id = this.client.id;
        if (client.valide === true) {
          client.preSaisie = false;
          this.preSaisie = '';
        }
        // Non-admin user : do not save, just record modifications
        if (!this.authService.currentUser.adminClient) {
          this.readOnlyMode = true;
          this.editing = false;
          client.preSaisie = true;
          this.preSaisie = 'preSaisie';
          this.modificationsService
          .saveModifications(Client.name, this.client, this.formGroup, 'tiers-clients-')
          .subscribe(e => {
            this.modifListe.refreshList();
            // Show red badges (unvalidated forms)
            this.validationService.showToValidateBadges();
            client = {id : client.id, preSaisie: true};
            this.clientsService.save_v2(['id', 'preSaisie'], {
              client,
            })
            .subscribe({
              next: () => {
                this.refreshGrid.emit();
                this.formGroup.markAsPristine();
              },
              error: (err) => {
                console.log(err);
                notify('Echec de la sauvegarde', 'error', 3000);
              }
            });
          });
        } else {
          this.saveData(client);
        }
      }

    }
  }

  saveData(client) {

    const certifications = this.mapCertificationsForSave(client.certifications);

    (client.valide !== undefined && this.client.valide !== client.valide && !this.createMode ?
      this.validatePopup.present(
        HistoryType.CLIENT,
        { client: { id: client.id }, valide: client.valide },
      ) : of(undefined))
      .pipe(
        switchMap(_ => this.clientsService.save_v2(this.getDirtyFieldsPath(), {
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
          // Show red badges (unvalidated forms)
          this.validationService.showToValidateBadges();
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

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.client);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/clients`]);
    }
  }

  valueToUpperCase(e) {
    if (!e.component.option('value')) return;
    e.component.option('value', e.component.option('value').toUpperCase());
    return e.component.option('value');
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  onSecteurChange(e) {
    // France => Echéance 30 J (et non modifiable voir html)
    if (this.editing && e.value) {
      this.formGroup.get('nbJourEcheance').markAsDirty();
      if (e.value.id === 'F') {
        this.formGroup.get('nbJourEcheance').setValue(30);
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
    this.tvaCeeFree = (sectors.includes(sector.id) && pays.id !== 'IE');
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
    if (!this.client) return;
    this.router.navigateByUrl(`/nested/n/tiers/clients/${this.client.id}/entrepots/list`);
  }

  contactsBtnClick() {
    if (!this.client) return;
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

  private getDirtyFieldsPath() {
    const dirtyFields = this.formUtils
    .extractDirty(this.formGroup.controls, Client.getKeyField());
    const gridFields = clientsGridConfig.columns
    .map(({dataField}) => dataField);

    return [
      ...this.formUtils.extractPaths(dirtyFields)
      .filter( path => !path.startsWith('certifications')),
      ...gridFields,
    ];
  }

}
