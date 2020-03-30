import {Component, OnInit} from '@angular/core';
import {LieuxPassageAQuaiService} from '../../../../shared/services/lieux-passage-a-quai.service';
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
  Societe, TypeClient, LieuPassageAQuai
} from '../../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-lieux-passage-a-quai-details',
  templateUrl: './lieux-passage-a-quai-details.component.html',
  styleUrls: ['./lieux-passage-a-quai-details.component.scss']
})
export class LieuxPassageAQuaiDetailsComponent implements OnInit {

  lieupassageaquaiForm = this.fb.group({
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
    type: [''],
    groupeClient: [''],
    soumisCtifl: [''],
    lieuFonctionEAN: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  lieupassageaquai: LieuPassageAQuai;
  pays: Pays[];
  code: string;
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  typeLieupassageaquai: any[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private lieupassageaquaiService: LieuxPassageAQuaiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.lieupassageaquaiService.getPays().then(p => {
      this.pays = p;
    });
    this.lieupassageaquaiService.getDevises().then(a => {
      this.devises = a;
    });
    this.lieupassageaquaiService.getMoyenPaiements().then(a => {
      this.moyenPaiements = a;
    });
    this.lieupassageaquaiService.getBasePaiements().then(a => {
      this.basePaiements = a;
    });
    this.lieupassageaquaiService.getRegimeTva().then(a => {
      this.regimeTva = a;
    });
    this.lieupassageaquaiService
      .get(this.route.snapshot.paramMap.get('id'))
      .then(c => {
        this.lieupassageaquai = c;
        this.lieupassageaquaiForm.patchValue(this.lieupassageaquai);
      });
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

}
