import {Component, OnInit} from '@angular/core';
import {FournisseursService} from '../../../../shared/services/fournisseurs.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BasePaiement,
  Fournisseur,
  Devise, GroupeFournisseur,
  Incoterm,
  MoyenPaiement,
  Pays,
  Personne,
  RegimeTva,
  Societe, TypeFournisseur
} from '../../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-fournisseur-details',
  templateUrl: './fournisseur-details.component.html',
  styleUrls: ['./fournisseur-details.component.scss']
})
export class FournisseurDetailsComponent implements OnInit {

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
    incoterm: [''],
    nbJourEcheance: [''],
    echeanceLe: [''],
    moyenPaiement: [''],
    tvaCee: [''],
    bureauAchat: [''],
    typeBureau: [''],
    blocageAvoirEdi: [''],
    debloquerEnvoieJour: [''],
    instructionLogistique: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    referenceCoface: [''],
    agrementBW: [''],
    codeStation: [''],
    idTracabilite: [''],
    typeFournisseur: [''],
    groupeFournisseur: [''],
    soumisCtifl: [''],
    formeJuridique:  [''],
    SiretAPE:  [''],
    idTVA:  [''],
    RCS:  [''],
    autoFacturation: [false],
    valide: [false],
    paramAvances: [],
    certifications: [],
    delaiBonFacturer: []
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  fournisseur: Fournisseur;
  pays: Pays[];
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  bureauAchat: any[];
  typeBureau: any[];
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private fournisseursService: FournisseursService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.fournisseursService.getPays().then(p => {
      this.pays = p;
    });
    this.fournisseursService.getCommerciaux().then(c => {
      this.commerciaux = c;
    });
    this.fournisseursService.getAssistantes().then(a => {
      this.assistantes = a;
    });
    this.fournisseursService.getDevises().then(a => {
      this.devises = a;
    });
    this.fournisseursService.getMoyenPaiements().then(a => {
      this.moyenPaiements = a;
    });
    this.fournisseursService.getBasePaiements().then(a => {
      this.basePaiements = a;
    });
    this.fournisseursService.getRegimeTva().then(a => {
      this.regimeTva = a;
    });
    this.fournisseursService
      .get(this.route.snapshot.paramMap.get('id'))
      .then(c => {
        this.fournisseur = c;
        this.fournisseurForm.patchValue(this.fournisseur);
      });
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
}
