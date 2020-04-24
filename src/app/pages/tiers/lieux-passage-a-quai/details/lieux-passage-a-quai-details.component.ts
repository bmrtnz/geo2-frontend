import { Component, OnInit, OnDestroy } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LieuPassageAQuai } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import { PaysService } from 'app/shared/services/pays.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-lieux-passage-a-quai-details',
  templateUrl: './lieux-passage-a-quai-details.component.html',
  styleUrls: ['./lieux-passage-a-quai-details.component.scss']
})
export class LieuxPassageAQuaiDetailsComponent implements OnInit, OnDestroy {

  lieupassageaquaiForm = this.fb.group({
    code: [''],
    raisonSocial: [''],
    pays: [''],
    type: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    ville: [''],
    codePostal: [''],
    lieuFonctionEan: [''],
    langue: [''],
    tvaCee: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    regimeTva: [''],
    devise: [''],
    moyenPaiement: [''],
    basePaiement: [''],
    contacts: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  private queryGetOneLieuPassageAQuai: Subscription;

  lieupassageaquai: LieuPassageAQuai;
  code: string;
  pays: Observable<DataSource>;
  devises: Observable<DataSource>;
  moyensPaiement: Observable<DataSource>;
  basesPaiement: Observable<DataSource>;
  regimesTva: Observable<DataSource>;
  bureauxAchat: Observable<DataSource>;
  typeLieupassageaquai: any[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private lieupassageaquaiService: LieuxPassageAQuaiService,
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

    this.queryGetOneLieuPassageAQuai = this.lieupassageaquaiService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.lieupassageaquai = res.data.lieuPassageAQuai;
      this.lieupassageaquaiForm.patchValue(this.lieupassageaquai);
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
    console.log(this.lieupassageaquaiForm.value);
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/lieupassageaquais/${this.lieupassageaquai.id}`]);
  }

  ngOnDestroy() {
    this.queryGetOneLieuPassageAQuai.unsubscribe();
  }

}
