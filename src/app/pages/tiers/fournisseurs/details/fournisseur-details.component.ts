import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { CertificationDatePopupComponent } from 'app/shared/components/certification-date-popup/certification-date-popup.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
import { InfoPopupComponent } from 'app/shared/components/info-popup/info-popup.component';
import { ModificationListComponent } from 'app/shared/components/modification-list/modification-list.component';
import { PushHistoryPopupComponent } from 'app/shared/components/push-history-popup/push-history-popup.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { AuthService } from 'app/shared/services';
import { BasesPaiementService } from 'app/shared/services/api/bases-paiement.service';
import { BureauxAchatService } from 'app/shared/services/api/bureaux-achat.service';
import { CertificationsService } from 'app/shared/services/api/certification.service';
import { ConditionsVenteService } from 'app/shared/services/api/conditions-vente.service';
import { DevisesService } from 'app/shared/services/api/devises.service';
import { GroupesFournisseurService } from 'app/shared/services/api/groupes-fournisseur.service';
import { HistoryType } from 'app/shared/services/api/historique.service';
import { IdentifiantsFournisseurService } from 'app/shared/services/api/identifiants-fournisseur.service';
import { ModificationsService } from 'app/shared/services/api/modification.service';
import { MoyensPaiementService } from 'app/shared/services/api/moyens-paiement.service';
import { NaturesStationService } from 'app/shared/services/api/natures-station.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { TypesFournisseurService } from 'app/shared/services/api/types-fournisseur.service';
import { ValidationService } from 'app/shared/services/api/validation.service';
import { FormUtilsService } from 'app/shared/services/form-utils.service';
import { fournisseur as fournisseursGridConfig } from 'assets/configurations/grids.json';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Certification, CertificationFournisseur, Fournisseur } from '../../../../shared/models';
import { FournisseursService } from '../../../../shared/services/api/fournisseurs.service';

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
    code: [''],
    identifiant: [''],
    raisonSocial: [''],
    stockActif: [''],
    stockPrecalibre: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    codePostal: [''],
    ville: [''],
    pays: [''],
    latitude: [''],
    longitude: [''],
    regimeTva: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    moyenPaiement: [''],
    tvaCee: [''],
    bureauAchat: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    agrementBW: [''],
    codeStation: [''],
    idTracabilite: [''],
    type: [''],
    lieuFonctionEan: [''],
    formeJuridique: [''],
    siretAPE: [''],
    tvaId: [''],
    rcs: [''],
    valide: [false],
    preSaisie: [''],
    certifications: [''],
    autoFacturation: [''],
    referenceIfco: [''],
    dateDebutIfco: [''],
    margeObjectifEuroKilo: [''],
    margeObjectifPourcentCa: [''],
    listeSocietes: [''],
    declarantCHEP: [''],
    suiviDestockage: [''],
    natureStation: [''],
    consignePaloxUdc: [''],
    consignePaloxSa: [''],
    dateConditionGeneraleAchatSignee: [''],
    declarantBacsCHEP: [''],
    indicateurModificationDetail: [''],
    fournisseurDeRattachement: [''],
    groupeFournisseur: [''],
    conditionVente: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  @ViewChild(InfoPopupComponent, { static: true }) infoComponent: InfoPopupComponent;
  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChild(PushHistoryPopupComponent, { static: false })
  validatePopup: PushHistoryPopupComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild(CertificationDatePopupComponent, { static: false })
  certDatePopup: CertificationDatePopupComponent;
  @ViewChild(ModificationListComponent, { static: false }) modifListe: ModificationListComponent;
  editing = false;

  fournisseur: Fournisseur;
  identifiant: DataSource;
  pays: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  naturesStation: DataSource;
  basesPaiement: DataSource;
  regimesTva: DataSource;
  bureauxAchat: DataSource;
  typesFournisseur: DataSource;
  defaultVisible: boolean;
  validateCommentPromptVisible = false;
  conditionsVente: DataSource;
  certifications: DataSource;
  gridBoxValue: number[];
  fournisseursDeRattachement: DataSource;
  groupesFournisseur: DataSource;
  isReadOnlyMode = true;
  createMode = false;
  preSaisie: string;
  autoFacturationChecked = false;
  ifcoChecked = false;
  IDTracaexists = false;
  CCexists = false;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private fournisseursService: FournisseursService,
    private bureauxAchatService: BureauxAchatService,
    private conditionsVenteService: ConditionsVenteService,
    private identifiantsFournisseurService: IdentifiantsFournisseurService,
    private typesFournisseurService: TypesFournisseurService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private moyensPaiementService: MoyensPaiementService,
    private naturesStationService: NaturesStationService,
    private basesPaiementService: BasesPaiementService,
    private certificationsService: CertificationsService,
    public validationService: ValidationService,
    private modificationsService: ModificationsService,
    private groupesFournisseurService: GroupesFournisseurService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private datePipe: DatePipe,
  ) {
    this.defaultVisible = false;
    this.checkCode = this.checkCode.bind(this);
    this.displayCertifNameDate = this.displayCertifNameDate.bind(this);
  }

  get readOnlyMode() {
    return this.isReadOnlyMode;
  }
  set readOnlyMode(value: boolean) {
    this.editing = !value;
    this.isReadOnlyMode = value;
  }

  ngAfterViewInit(): void {
    // Ouverture ou fermeture accordéons (création) - old car plus d'accordéons
    // this.openCloseAccordions(this.createMode);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  checkEmptyModificationList(listLength) {
    if (listLength === 0 && this.authService.currentUser.adminClient) {
      if (this.formGroup.valid) {
        const fournisseur = {id : this.fournisseur.id, preSaisie: false, valide: true};
        this.formGroup.get('valide').setValue(true);
        this.formGroup.get('valide').markAsDirty();
        this.preSaisie = '';
        const validModif = true;
        this.saveData(fournisseur, validModif);
      }
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
          this.fournisseursService.getOne(params.id)
            .subscribe(res => {
              this.fournisseur = res.data.fournisseur;
              const certifications = this.mapCertificationsForDisplay(this.fournisseur.certifications);
              this.formGroup.patchValue({ ...this.fournisseur, certifications });
              this.preSaisie = this.fournisseur.preSaisie === true ? 'preSaisie' : '';
              this.certifications.reload();
            });
        } else {
          this.fournisseur = new Fournisseur({});
          // Set condit vente
          this.formGroup.get('conditionVente').setValue({id: 'ACHATS'});
          this.formGroup.get('conditionVente').markAsDirty();
        }
        this.contentReadyEvent.emit();
      });

    this.pays = this.paysService.getDataSource_v2(['id', 'description']);
    this.pays.filter(['valide', '=', 'true']);
    this.bureauxAchat = this.bureauxAchatService.getDataSource_v2(['id', 'raisonSocial']);
    this.identifiant = this.identifiantsFournisseurService.getDataSource();
    this.typesFournisseur = this.typesFournisseurService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.naturesStation = this.naturesStationService.getDataSource();
    this.conditionsVente = this.conditionsVenteService.getDataSource();
    this.fournisseursDeRattachement = this.fournisseursService.getDataSource_v2(['id', 'raisonSocial']);
    this.groupesFournisseur = this.groupesFournisseurService.getDataSource();
    this.certifications = this.certificationsService.getDataSource();

  }

  F(params) {
    params.value = params.value.toUpperCase();
  }

  valueToUpperCase(e) {
    if (!e.component.option('value')) return;
    e.component.option('value', e.component.option('value').toUpperCase());
    return e.component.option('value');
  }

  onNonRequiredSBChange(e) {
    if (this.editing && e.value === null) {
      this.formUtils.setIdToNull(this.formGroup, e.element.attributes.formcontrolname.nodeValue);
    }
  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const fournisseursSource = this.fournisseursService.getDataSource_v2(['code']);
    fournisseursSource.searchExpr('code');
    fournisseursSource.searchOperation('=');
    fournisseursSource.searchValue(code);
    return fournisseursSource.load().then(res => !(res.length));
  }

  checkCompteComptable(e) {
    const compteComptable = this.valueToUpperCase(e);
    if (!compteComptable) return;
    const fournisseursSource = this.fournisseursService.getDataSource_v2(['compteComptable']);
    fournisseursSource.filter(['compteComptable', '=', compteComptable]);
    fournisseursSource.load().then(res => res.length ? this.CCexists = true : this.CCexists = false);
  }

  onAutoFactChange(params) {
   this.autoFacturationChecked = params.value;
  }

  onIfcoChange(params) {
    this.ifcoChecked = params.value;
  }

  displayIDBefore(data) {
    return data ? (data.id + ' - ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description))) : null;
  }

  displayCertifNameDate(data) {
    if (data && this.fournisseur) {
      let dateCert = this.fournisseur?.certifications &&
        this.fournisseur.certifications
        .find(res => res.certification.id === data.id)?.dateValidite;
      if (dateCert) {
        const mydate = new Date(dateCert);
        dateCert = mydate.toLocaleDateString();
      }
      return data ? data.description + (dateCert ? ' (=> ' + dateCert + ')' : '') : null;
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
      let fournisseur = this.formUtils.extractDirty(this.formGroup.controls, Fournisseur.getKeyField());
      console.log(fournisseur)
      if (this.createMode) {

        this.infoComponent.visible = true;
        this.infoComponent.doNavigate.subscribe(res => {
          if (res) {
            fournisseur.code = this.formGroup.get('code').value.toUpperCase();
            // Ici on fait rien pour le moment l'id est deja dans l'object fournisseur
            // Avoir pour les valeur par defaut (qui sont not null dans la base)
            fournisseur.preSaisie = true;
            fournisseur.valide = false;
            this.saveData(fournisseur);
          }
        });

      } else {
        if (fournisseur.valide === true) {
          fournisseur.preSaisie = false;
          this.preSaisie = '';
        }
        fournisseur.id = this.fournisseur.id;

        // Non-admin user : do not save, just record modifications
        if (!this.authService.currentUser.adminClient) {
          this.readOnlyMode = true;
          this.editing = false;
          fournisseur.preSaisie = true;
          this.preSaisie = 'preSaisie';
          this.modificationsService
          .saveModifications(Fournisseur.name, this.fournisseur, this.formGroup, 'tiers-fournisseurs-')
          .subscribe(e => {
            this.modifListe.refreshList();
            // Show red badges (unvalidated forms)
            this.validationService.showToValidateBadges();
            fournisseur = {id : fournisseur.id, preSaisie: true};
            this.fournisseursService.save_v2(['id', 'preSaisie'], {
              fournisseur,
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
          this.saveData(fournisseur);
        }
      }

    }
  }

  saveData(fournisseur, validModif?) {

    /* tslint:disable-next-line max-line-length */
    const certifications = this.formGroup.get('certifications').dirty && this.mapCertificationsForSave(this.formGroup.get('certifications').value);

    ((fournisseur.valide !== undefined && ((this.fournisseur.valide !== fournisseur.valide) || validModif) && !this.createMode) ?
      this.validatePopup.present(
        HistoryType.FOURNISSEUR,
        { fournisseur: { id: fournisseur.id }, valide: fournisseur.valide },
      ) : of(undefined))
      .pipe(
        switchMap(_ => certifications ? this.certDatePopup.present(certifications) : of(undefined)),
        switchMap(certs => this.fournisseursService.save_v2(this.getDirtyFieldsPath(), {
          fournisseur: {
            ...fournisseur,
            certifications: certs,
          }
        })),
      )
      .subscribe({
        next: (e) => {
          if (this.createMode || this.authService.currentUser.adminClient) notify('Sauvegardé', 'success', 3000);
          this.refreshGrid.emit();
          // Show red badges (unvalidated forms)
          this.validationService.showToValidateBadges();
          if (!this.createMode) {
            this.fournisseur = {
              ...this.fournisseur,
              ...this.formGroup.getRawValue(),
            };
            this.readOnlyMode = true;
          } else {
            this.editing = false;
            this.router.navigate([`/pages/tiers/fournisseurs/${e.data.saveFournisseur.id}`]);
          }
          this.fournisseur.historique = e.data.saveFournisseur.historique;
          this.fournisseur.typeTiers = e.data.saveFournisseur.typeTiers;
          this.fournisseur.certifications = e.data.saveFournisseur.certifications;
          this.formGroup.markAsPristine();
        },
        error: (err) => {
          console.log(err);
          notify('Echec de la sauvegarde', 'error', 3000);
        }
      });

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

  onIDTracaChange(e) {
    const idTracabilite = this.valueToUpperCase(e);
    if (!idTracabilite || !this.createMode) return;
    // Code station = idTracabilite
    if (idTracabilite) {
      this.formGroup.get('codeStation').markAsDirty();
      this.formGroup.get('codeStation').setValue(idTracabilite);
    }
    // Check if already exists
    const fournisseursSource = this.fournisseursService.getDataSource_v2(['idTracabilite']);
    fournisseursSource.searchExpr('idTracabilite');
    fournisseursSource.searchOperation('=');
    fournisseursSource.searchValue(idTracabilite);
    fournisseursSource.load().then(res => res.length ? this.IDTracaexists = true : this.IDTracaexists = false);
  }

  toUppercase(e) {
    console.log(e);
    // e.value = e.value.toUpperCase();
  }

  onCancel() {

    if (!this.createMode) {
      this.formGroup.reset(this.fournisseur);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/pages/tiers/fournisseurs`]);
    }
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/pages/tiers/contacts/${this.fournisseur.code}/${this.fournisseur.typeTiers}`]);
  }

  private mapCertificationsForDisplay(certifications: CertificationFournisseur[]): Certification[] {
    if (!certifications || !certifications.length) return [];
    return certifications.map(({ certification }) => certification);
  }

  private mapCertificationsForSave(certifications: Certification[]): CertificationFournisseur[] {
    if (!certifications || !certifications.length) return [];

    return certifications
      .map((certification) => {
        const cc = this.fournisseur.certifications && this.fournisseur.certifications
        .find(({ certification: cert }) => cert.id === certification.id);

        // removing __typename or it fail
        certification = { ...certification };
        if ((certification as any).__typename)
          delete (certification as any).__typename;

        return {
          id: cc ? cc.id : null,
          certification,
          dateValidite: cc && cc.dateValidite ?
            this.datePipe.transform(cc.dateValidite, 'yyyy-MM-dd') :
            null,
        };
      });
  }

  private getDirtyFieldsPath() {
    const dirtyFields = this.formUtils
    .extractDirty(this.formGroup.controls, Fournisseur.getKeyField());
    const gridFields = fournisseursGridConfig.columns
    .map(({dataField}) => dataField);

    return [...new Set([
      ...this.formUtils.extractPaths(dirtyFields)
      .filter( path => !path.startsWith('certifications')),
      ...gridFields,
      'typeTiers',
      'historique.id',
      'historique.commentaire',
      'historique.valide',
      'historique.userModification',
      'historique.dateModification',
      'certifications.id',
      'certifications.certification.id',
    ])];
  }

}
