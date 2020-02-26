import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {

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
    //public courtier: Courtier; // TODO
    courtageModeCalcul: [''],
    courtageValeur: [''],
    typeClient: [''],
    groupeClient: [''],
    soumisCtifl: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  client: Client;
  secteurs: Secteur[];
  pays: Pays[];
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.clientsService.getSecteurs().then(s => {
      this.secteurs = s;
    });
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
    this.clientsService
      .get(this.route.snapshot.paramMap.get('id'))
      .then(c => {
        this.client = c;
        this.clientForm.patchValue(this.client);
      });
  }

  debug(test) {
    console.log(test);
  }

  onSubmit() {
    console.log(this.clientForm.value);
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }
}
