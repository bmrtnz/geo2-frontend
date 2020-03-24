import {Component, OnInit} from '@angular/core';
import {EntrepotsService} from '../../../shared/services/entrepots.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BasePaiement,
  Transporteur,
  Devise,
  Incoterm,
  MoyenPaiement,
  Pays,
  Personne,
  RegimeTva
} from '../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-entrepot-details',
  templateUrl: './entrepot-details.component.html',
  styleUrls: ['./entrepot-details.component.scss']
})
export class EntrepotDetailsComponent implements OnInit {

  entrepotForm = this.fb.group({
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
    lieuFonctionEANDepot: [''],
    lieuFonctionEANAcheteur: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  transporteur: Transporteur;
  pays: Pays[];
  code: string;
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  incoterm: Incoterm[];
  typeTransporteur: any[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private entrepotsService: EntrepotsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.entrepotsService.getPays().then(p => {
      this.pays = p;
    });
    this.entrepotsService.getCommerciaux().then(c => {
      this.commerciaux = c;
    });
    this.entrepotsService.getAssistantes().then(a => {
      this.assistantes = a;
    });
    this.entrepotsService.getDevises().then(a => {
      this.devises = a;
    });
    this.entrepotsService.getMoyenPaiements().then(a => {
      this.moyenPaiements = a;
    });
    this.entrepotsService.getBasePaiements().then(a => {
      this.basePaiements = a;
    });
    this.entrepotsService.getRegimeTva().then(a => {
      this.regimeTva = a;
    });
    this.entrepotsService
      .get(this.route.snapshot.paramMap.get('id'))
      .then(c => {
        this.transporteur = c;
        this.entrepotForm.patchValue(this.transporteur);
      });
  }

  debug(test) {
    console.log(test);
  }

  onSubmit() {
    console.log(this.entrepotForm.value);
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }
}
