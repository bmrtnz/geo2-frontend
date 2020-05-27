import { Component, OnInit } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Fournisseur } from '../../../../shared/models';
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

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit {

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
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  fournisseur: Fournisseur;
  pays: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  regimesTva: DataSource;
  bureauxAchat: DataSource;
  typesFournisseur: DataSource;
  defaultVisible: boolean;
  readOnlyMode = true;

  constructor(
    private fb: FormBuilder,
    private fournisseursService: FournisseursService,
    private bureauxAchatService: BureauxAchatService,
    private typesFournisseurService: TypesFournisseurService,
    private regimesTvaService: RegimesTvaService,
    private devisesService: DevisesService,
    private moyensPaiementService: MoyensPaiementService,
    private basesPaiementService: BasesPaiementService,
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {

    this.fournisseursService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.fournisseur = res.data.fournisseur;
      this.fournisseurForm.patchValue(this.fournisseur);
    });

    this.pays = this.paysService.getDataSource();
    this.bureauxAchat = this.bureauxAchatService.getDataSource();
    this.typesFournisseur = this.typesFournisseurService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();

  }

  debug(test) {
    console.log(test);
  }

  onSubmit() {
    if (!this.fournisseurForm.pristine && this.fournisseurForm.valid) {
      const fournisseur = this.fournisseursService
      .extractDirty(this.fournisseurForm.controls);
      this.fournisseursService
      .save({ fournisseur: { ...fournisseur, id: this.fournisseur.id } })
      .subscribe({
        next: () => {
          notify('Sauvegardé', 'success', 3000);
          this.fournisseur = { id: this.fournisseur.id, ...this.fournisseurForm.getRawValue() };
          this.readOnlyMode = true;
        },
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
  }

  onCancel() {
    this.fournisseurForm.reset(this.fournisseur);
    this.readOnlyMode = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    const search = `codeTiers=="${ this.fournisseur.id }" and typeTiers==${ this.fournisseur.typeTiers }`;
    this.router.navigate([`/tiers/contacts/${ this.fournisseur.id }/${ this.fournisseur.typeTiers }`], {
      queryParams: { search },
    });
  }

}
