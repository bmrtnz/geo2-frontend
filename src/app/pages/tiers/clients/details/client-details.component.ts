import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { SecteursService } from 'app/shared/services/secteurs.service';
import { map } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import { PersonnesService } from 'app/shared/services/personnes.service';
import { PaysService } from 'app/shared/services/pays.service';
import { TypesClientService } from 'app/shared/services/types-client.service';
import { IncotermsService } from 'app/shared/services/incoterms.service';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {

  clientForm = this.fb.group({
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
    debloquerEnvoieJour: [''],
    ifco: [''],
    instructionLogistique: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    commercial: [''],
    assistante: [''],
    referenceCoface: [''],
    agrement: [''],
    // public courtier: Courtier; // TODO
    courtageModeCalcul: [''],
    courtageValeur: [''],
    typeClient: [''],
    groupeClient: [''],
    soumisCtifl: [''],
    valide: [false],
    lieuFonctionEAN: [''],
    delaiBonFacturer: [''],
    certifications: [''],
    paramAvances: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  private queryGetClient: Subscription;

  client: Client;
  secteurs: Observable<DataSource>;
  pays: Observable<DataSource>;
  code: string;
  personnes: Observable<DataSource>;
  typesClient: Observable<DataSource>;
  incoterms: Observable<DataSource>;
  devises: Observable<DataSource>;
  moyensPaiement: Observable<DataSource>;
  basesPaiement: Observable<DataSource>;
  regimesTva: Observable<DataSource>;
  defaultVisible: boolean;

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
    private moyensPaiementService: MoyensPaiementService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {

    this.queryGetClient = this.clientsService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.client = res.data.client;
      this.clientForm.patchValue(this.client);
    });

    this.secteurs = this.secteursService.getAll({offset: 100})
    .pipe(
      map( res => this.secteursService.asDataSource(res.data.allSecteur)),
    );

    this.personnes = this.personnesService.getAll({offset: 500})
    .pipe(
      map( res => this.personnesService.asDataSource(res.data.allPersonne)),
    );

    this.pays = this.paysService.getAll({offset: 200})
    .pipe(
      map( res => this.paysService.asDataSource(res.data.allPays)),
    );

    this.typesClient = this.typesClientService.getAll({offset: 50})
    .pipe(
      map( res => this.typesClientService.asDataSource(res.data.allTypeClient)),
    );

    this.incoterms = this.incotermsService.getAll({offset: 50})
    .pipe(
      map( res => this.incotermsService.asDataSource(res.data.allIncoterm)),
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

  debug(test: any) {
    console.log(test);
  }

  onSubmit() {
    console.log(this.clientForm.value);
    // if (!this.clientForm.pristine && this.clientForm.valid) {
    //   this.clientsService
    //   .update({ client: this.clientForm.value })
    //   .subscribe((res) => console.log(res));
    // }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  entrepotsBtnClick() {
    // this.router.navigate([`./entrepots/${this.client.id}`]);
    this.router.navigate([`/tiers/entrepots`]);
  }

  contactsBtnClick() {
    // this.router.navigate([`./entrepots/${this.client.id}`]);
    this.router.navigate([`/tiers/contacts/clients/${this.client.id}`]);
  }

  ngOnDestroy() {
    this.queryGetClient.unsubscribe();
  }
}
