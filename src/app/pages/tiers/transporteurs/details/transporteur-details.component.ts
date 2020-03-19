import {Component, OnInit} from '@angular/core';
import {TransporteursService} from '../../../../shared/services/transporteurs.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BasePaiement,
  Transporteur,
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
  selector: 'app-transporteur-details',
  templateUrl: './transporteur-details.component.html',
  styleUrls: ['./transporteur-details.component.scss']
})
export class TransporteurDetailsComponent implements OnInit {

  transporteurForm = this.fb.group({
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
    lieuFonctionEAN: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  transporteur: Transporteur;
  secteurs: Secteur[];
  pays: Pays[];
  code: string;
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  typeTransporteur: any[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private transporteursService: TransporteursService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.transporteursService.getSecteurs().then(s => {
      this.secteurs = s;
    });
    this.transporteursService.getPays().then(p => {
      this.pays = p;
    });
    this.transporteursService.getCommerciaux().then(c => {
      this.commerciaux = c;
    });
    this.transporteursService.getAssistantes().then(a => {
      this.assistantes = a;
    });
    this.transporteursService.getDevises().then(a => {
      this.devises = a;
    });
    this.transporteursService.getMoyenPaiements().then(a => {
      this.moyenPaiements = a;
    });
    this.transporteursService.getBasePaiements().then(a => {
      this.basePaiements = a;
    });
    this.transporteursService.getRegimeTva().then(a => {
      this.regimeTva = a;
    });
    this.transporteursService
      .get(this.route.snapshot.paramMap.get('id'))
      .then(c => {
        this.transporteur = c;
        this.transporteurForm.patchValue(this.transporteur);
      });
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
}
