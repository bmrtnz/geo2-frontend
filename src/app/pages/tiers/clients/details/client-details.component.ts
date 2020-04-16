import {Component, OnInit, OnDestroy} from '@angular/core';
import {ClientsService} from '../../../../shared/services';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BasePaiement,
  Client,
  Devise, GroupeClient,
  Incoterm,
  MoyenPaiement,
  Pays,
  Personne,
  RegimeTva,
  Secteur,
  Societe, TypeClient
} from '../../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { Subscription } from 'rxjs';
import { SecteursService } from 'app/shared/services/secteurs.service';

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
  private queryGetOneClient: Subscription;

  client: Client;
  secteurs: Secteur[];
  pays: Pays[];
  code: string;
  commerciaux: Personne[];
  clients: Client[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: BasePaiement[];
  regimeTva: RegimeTva[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private secteursService: SecteursService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.clientsService.getPays().then(p => {
      this.pays = p;
    });
    this.clientsService.getCommerciaux().then(c => {
      this.commerciaux = c;
    });
    this.clientsService.getAssistantes().then(a => {
      this.assistantes = a;
    });
    this.clientsService.getDevises().then(a => {
      this.devises = a;
    });
    this.clientsService.getMoyenPaiements().then(a => {
      this.moyenPaiements = a;
    });
    this.clientsService.getBasePaiements().then(a => {
      this.basePaiements = a;
    });
    this.clientsService.getRegimeTva().then(a => {
      this.regimeTva = a;
    });

    // TODO fetch all secteurs ( not just first page )
    this.secteursService.getAll()
    .subscribe( res => this.secteurs = res.data.allSecteur.edges.map(({node}) => node));

    this.queryGetOneClient = this.clientsService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.client = res.data.client;
      this.clientForm.patchValue(this.client);
    });


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
    this.queryGetOneClient.unsubscribe();
  }
}
