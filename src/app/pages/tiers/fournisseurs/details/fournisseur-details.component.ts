import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { CertificationDatePopupComponent } from 'app/shared/components/certification-date-popup/certification-date-popup.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';
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
import { MoyensPaiementService } from 'app/shared/services/api/moyens-paiement.service';
import { NaturesStationService } from 'app/shared/services/api/natures-station.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { TypesFournisseurService } from 'app/shared/services/api/types-fournisseur.service';
import { DxAccordionComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { from, of } from 'rxjs';
import { concatAll, mergeAll, switchMap, tap } from 'rxjs/operators';
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
    raisonSocial: [''],
    stockActif: [''],
    stockPrecalibre: [''],
    societe: [''],
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
    typeBureau: [''],
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
    paramAvances: [''],
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
  @ViewChild(FileManagerComponent, { static: false }) fileManagerComponent: FileManagerComponent;
  @ViewChild(PushHistoryPopupComponent, { static: false })
  validatePopup: PushHistoryPopupComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild(CertificationDatePopupComponent, { static: false })
  certDatePopup: CertificationDatePopupComponent;
  editing = false;

  fournisseur: Fournisseur;
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

  constructor(
    private fb: FormBuilder,
    private fournisseursService: FournisseursService,
    private bureauxAchatService: BureauxAchatService,
    private conditionsVenteService: ConditionsVenteService,
    private typesFournisseurService: TypesFournisseurService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private moyensPaiementService: MoyensPaiementService,
    private naturesStationService: NaturesStationService,
    private basesPaiementService: BasesPaiementService,
    private certificationsService: CertificationsService,
    private groupesFournisseurService: GroupesFournisseurService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private datePipe: DatePipe,
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
    this.formGroup.reset(this.fournisseur);
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
          this.fournisseursService.getOne(params.id)
            .subscribe(res => {
              this.fournisseur = res.data.fournisseur;
              const certifications = this.mapCertificationsForDisplay(this.fournisseur.certifications);
              this.formGroup.patchValue({ ...this.fournisseur, certifications });
              this.preSaisie = this.fournisseur.preSaisie === true ? 'preSaisie' : '';
            });
        } else {
          this.fournisseur = new Fournisseur({});
        }
        this.contentReadyEvent.emit();
      });

    this.pays = this.paysService.getDataSource();
    this.pays.filter(['valide', '=', 'true']);
    this.bureauxAchat = this.bureauxAchatService.getDataSource();
    this.typesFournisseur = this.typesFournisseurService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.naturesStation = this.naturesStationService.getDataSource();
    this.conditionsVente = this.conditionsVenteService.getDataSource();
    this.fournisseursDeRattachement = this.fournisseursService.getDataSource();
    this.groupesFournisseur = this.groupesFournisseurService.getDataSource();
    this.certifications = this.certificationsService.getDataSource();

  }

  F(params) {
    params.value = params.value.toUpperCase();
  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const fournisseursSource = this.fournisseursService.getDataSource();
    fournisseursSource.searchExpr('code');
    fournisseursSource.searchOperation('=');
    fournisseursSource.searchValue(code);
    return fournisseursSource.load().then(res => !(res.length));
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
      const fournisseur = this.fournisseursService.extractDirty(this.formGroup.controls);

      if (this.createMode) {
        // fournisseur.id = this.formGroup.get('id').value.toUpperCase();
        fournisseur.code = this.formGroup.get('code').value.toUpperCase();
        // Ici on fait rien pour le moment l'id est deja dans l'object fournisseur
        // Avoir pour les valeur par defaut (qui sont not null dans la base)
        fournisseur.preSaisie = true;
        fournisseur.valide = false;
      } else {
        if (fournisseur.valide === true) {
          fournisseur.preSaisie = false;
          this.preSaisie = '';
        }
        fournisseur.id = this.fournisseur.id;
      }

      /* tslint:disable-next-line max-line-length */
      const certifications = this.formGroup.get('certifications').dirty && this.mapCertificationsForSave(this.formGroup.get('certifications').value);

      (fournisseur.valide !== undefined && this.fournisseur.valide !== fournisseur.valide && !this.createMode ?
        this.validatePopup.present(
          HistoryType.FOURNISSEUR,
          { fournisseur: { id: fournisseur.id }, valide: fournisseur.valide },
        ) : of(undefined))
        .pipe(
          switchMap(_ => certifications ? this.certDatePopup.present(certifications) : of(undefined)),
          switchMap(certs => this.fournisseursService.save({
            fournisseur: {
              ...fournisseur,
              certifications: certs,
            }
          })),
        )
        .subscribe({
          next: (e) => {
            notify('Sauvegardé', 'success', 3000);
            this.refreshGrid.emit();
            if (!this.createMode) {
              this.fournisseur = {
                ...this.fournisseur,
                ...this.formGroup.getRawValue(),
              };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/tiers/fournisseurs/${e.data.saveFournisseur.id}`]);
            }
            this.fournisseur.historique = e.data.saveFournisseur.historique;
            this.fournisseur.typeTiers = e.data.saveFournisseur.typeTiers;
            this.fournisseur.certifications = e.data.saveFournisseur.certifications;
            this.formGroup.markAsPristine();
          },
          error: (err) => console.log(err),
          // error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
    }
  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.fournisseur);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/fournisseurs`]);
    }
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${this.fournisseur.id}/${this.fournisseur.typeTiers}`]);
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

}
