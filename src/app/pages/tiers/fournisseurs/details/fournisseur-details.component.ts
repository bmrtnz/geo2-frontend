import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import notify from 'devextreme/ui/notify';
import { TypeTiers } from 'app/shared/models/tier.model';
import { ConditionsVenteService } from 'app/shared/services/conditions-vente.service';
import { GroupesFournisseurService } from 'app/shared/services/groupes-fournisseur.service';

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit, AfterViewInit {

  fournisseurForm = this.fb.group({
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
  conditionsVente: DataSource;
  gridBoxValue: number[];
  fournisseursDeRattachement: DataSource;
  groupesFournisseur: DataSource;
  readOnlyMode = true;
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
    private groupesFournisseurService: GroupesFournisseurService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.defaultVisible = false;
    this.checkCode = this.checkCode.bind(this);
  }

  ngAfterViewInit(): void {
    this.fournisseurForm.reset(this.fournisseur);
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.createMode = this.route.snapshot.url[0].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.fournisseursService
          .getOne(params.id)
          .subscribe( res => {
            this.fournisseur = res.data.fournisseur;
            console.log(this.fournisseur.fournisseurDeRattachement);
            this.fournisseurForm.patchValue(this.fournisseur);
          });
      } else {
        this.fournisseur = new Fournisseur({});
      }
    });

    this.pays = this.paysService.getDataSource();
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

  }

  onCodeChange(params) {
    params.value = params.value.toUpperCase() + '2';
  }

  checkCode(params) {
      const code = params.value.toUpperCase();
      const fournisseursSource = this.fournisseursService.getDataSource({ search: `id=="${ code }"` });
      return fournisseursSource.load().then(res => !(res.length));
  }

  onSubmit() {

    if (!this.fournisseurForm.pristine && this.fournisseurForm.valid) {
      const fournisseur = this.fournisseursService.extractDirty(this.fournisseurForm.controls);

      if (this.createMode) {
        fournisseur.id = this.fournisseurForm.get('id').value.toUpperCase();
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
            if (!this.createMode) {
              this.fournisseur = { id: this.fournisseur.id, ...this.fournisseurForm.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.router.navigate([`/tiers/fournisseurs/${fournisseur.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
      }
  }

  onCancel() {
    if (!this.createMode) {
      this.fournisseurForm.reset(this.fournisseur);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/fournisseurs`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.fournisseur.id }/${ this.fournisseur.typeTiers }`]);
  }

}
