import { Component, OnInit, AfterViewInit, EventEmitter, ViewChild } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Fournisseur } from '../../../../shared/models';
import { NaturesStationService } from 'app/shared/services/natures-station.service';
import { FormBuilder } from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import { PaysService } from 'app/shared/services/pays.service';
import { BureauxAchatService } from 'app/shared/services/bureaux-achat.service';
import { TypesFournisseurService } from 'app/shared/services/types-fournisseur.service';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import { CertificationsService } from 'app/shared/services/certification.service';
import notify from 'devextreme/ui/notify';
import { ConditionsVenteService } from 'app/shared/services/conditions-vente.service';
import { GroupesFournisseurService } from 'app/shared/services/groupes-fournisseur.service';
import { NestedPart } from 'app/pages/nested/nested.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { tap } from 'rxjs/operators';
import { FileManagerComponent } from 'app/shared/components/file-manager/file-manager-popup.component';

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
    id: [''],
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
    formeJuridique:  [''],
    siretAPE:  [''],
    tvaId:  [''],
    rcs:  [''],
    valide: [false],
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
    this.formGroup.reset(this.fournisseur);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {

    this.route.params
    .pipe(tap( _ => this.formGroup.reset()))
    .subscribe(params => {
      const url = this.route.snapshot.url;
      this.createMode = url[url.length - 1].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.fournisseursService
          .getOne(params.id)
          .subscribe( res => {
            this.fournisseur = res.data.fournisseur;
            // console.log(this.fournisseur.fournisseurDeRattachement);
            this.formGroup.patchValue(this.fournisseur);
            this.contentReadyEvent.emit();
          });
      } else {
        this.fournisseur = new Fournisseur({});
        this.contentReadyEvent.emit();
      }
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
      fournisseursSource.filter(['id', '=', code]);
      return fournisseursSource.load().then(res => !(res.length));
  }

  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const fournisseur = this.fournisseursService.extractDirty(this.formGroup.controls);

      if (this.createMode) {
        fournisseur.id = this.formGroup.get('id').value.toUpperCase();
          // Ici on fait rien pour le moment l'id est deja dans l'object fournisseur
          // Avoir pour les valeur par defaut (qui sont not null dans la base)
      } else {
        fournisseur.id = this.fournisseur.id;
      }

      this.fournisseursService
      .save({ fournisseur })
        .subscribe({
          next: () => {
            notify('Sauvegardé', 'success', 3000);
            this.refreshGrid.emit();
            if (!this.createMode) {
              this.fournisseur = { id: this.fournisseur.id, ...this.formGroup.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/tiers/fournisseurs/${fournisseur.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
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

  onValideChange(e) {
    if (e.event) { // Changed by user
      if (e.value) {
        // this.fournisseur.preSaisie = false;
      }
      this.validateCommentPromptVisible = true;
    }
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.fournisseur.id }/${ this.fournisseur.typeTiers }`]);
  }

}
