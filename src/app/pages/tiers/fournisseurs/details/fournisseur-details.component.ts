import { Component, OnInit, OnDestroy } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Fournisseur } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { PaysService } from 'app/shared/services/pays.service';
import { map } from 'rxjs/operators';
import { BureauxAchatService } from 'app/shared/services/bureaux-achat.service';
import { TypesFournisseurService } from 'app/shared/services/types-fournisseur.service';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit, OnDestroy {

  fournisseurForm = this.fb.group({
    code: [''],
    raisonSocial: [''],
    stockActif: [''],
    suiviPrecalibre: [''],
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
    // incoterm: [''], // Ne sert plus ?
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
    referenceCoface: [''],
    agrementBW: [''],
    codeStation: [''],
    idTracabilite: [''],
    type: [''],
    lieuFonctionEAN: [''],
    soumisCtifl: [''],
    formeJuridique:  [''],
    siretAPE:  [''],
    idTVA:  [''],
    rcs:  [''],
    autoFacturation: [false],
    valide: [false],
    paramAvances: [''],
    certifications: [''],
    delaiBonFacturer: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  private queryGetOneFournisseur: Subscription;

  fournisseur: Fournisseur;
  pays: Observable<DataSource>;
  devises: Observable<DataSource>;
  moyensPaiement: Observable<DataSource>;
  basesPaiement: Observable<DataSource>;
  regimesTva: Observable<DataSource>;
  bureauxAchat: Observable<DataSource>;
  typesFournisseur: Observable<DataSource>;
  typeBureau: any[];
  defaultVisible: boolean;

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
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {

    this.queryGetOneFournisseur = this.fournisseursService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.fournisseur = res.data.fournisseur;
      this.fournisseurForm.patchValue(this.fournisseur);
    });

    this.pays = this.paysService.getAll({offset: 200})
    .pipe(
      map( res => this.paysService.asDataSource(res.data.allPays)),
    );

    this.bureauxAchat = this.bureauxAchatService.getAll({offset: 200})
    .pipe(
      map( res => this.bureauxAchatService.asDataSource(res.data.allBureauAchat)),
    );

    this.typesFournisseur = this.typesFournisseurService.getAll({offset: 200})
    .pipe(
      map( res => this.typesFournisseurService.asDataSource(res.data.allTypeFournisseur)),
    );

    this.regimesTva = this.regimesTvaService.getAll({offset: 50})
    .pipe(
      map( res => this.regimesTvaService.asDataSource(res.data.allRegimeTva)),
    );

    this.devises = this.devisesService.getAll({offset: 50})
    .pipe(
      map( res => this.devisesService.asDataSource(res.data.allDevise)),
    );

    this.moyensPaiement = this.moyensPaiementService.getAll({offset: 50})
    .pipe(
      map( res => this.moyensPaiementService.asDataSource(res.data.allMoyenPaiement)),
    );

    this.basesPaiement = this.basesPaiementService.getAll({offset: 50})
    .pipe(
      map( res => this.basesPaiementService.asDataSource(res.data.allBasePaiement)),
    );

  }

  debug(test) {
    console.log(test);
  }

  onSubmit() {
    console.log(this.fournisseurForm.value);
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/fournisseurs/${this.fournisseur.id}`]);
  }

  ngOnDestroy() {
    this.queryGetOneFournisseur.unsubscribe();
  }

}
