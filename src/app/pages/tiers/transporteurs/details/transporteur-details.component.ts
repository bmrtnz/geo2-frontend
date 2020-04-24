import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransporteursService } from '../../../../shared/services/transporteurs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Transporteur } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import { PaysService } from 'app/shared/services/pays.service';
import DataSource from 'devextreme/data/data_source';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transporteur-details',
  templateUrl: './transporteur-details.component.html',
  styleUrls: ['./transporteur-details.component.scss']
})
export class TransporteurDetailsComponent implements OnInit, OnDestroy {

  transporteurForm = this.fb.group({
    code: [''],
    raisonSocial: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    codePostal: [''],
    ville: [''],
    pays: [''],
    regimeTva: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    moyenPaiement: [''],
    tvaCee: [''],
    clientRaisonSociale: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    referenceCoface: [''],
    type: [''],
    lieuFonctionEan: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  private queryGetOneTransporteur: Subscription;

  transporteur: Transporteur;
  code: string;
  pays: Observable<DataSource>;
  devises: Observable<DataSource>;
  moyensPaiement: Observable<DataSource>;
  basesPaiement: Observable<DataSource>;
  regimesTva: Observable<DataSource>;
  bureauxAchat: Observable<DataSource>;
  typesTransporteur: Observable<DataSource>;
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private transporteursService: TransporteursService,
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

    this.queryGetOneTransporteur = this.transporteursService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.transporteur = res.data.transporteur;
      this.transporteurForm.patchValue(this.transporteur);
    });

    this.pays = this.paysService.getAll({offset: 200})
    .pipe(
      map( res => this.paysService.asDataSource(res.data.allPays)),
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
    console.log(this.transporteurForm.value);
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/transporteurs/${this.transporteur.id}`]);
  }

  ngOnDestroy() {
    this.queryGetOneTransporteur.unsubscribe();
  }

}
