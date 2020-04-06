import {Component, OnInit} from '@angular/core';
import {EntrepotsService} from '../../../../shared/services/entrepots.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  Entrepot,
  Devise,
  Incoterm,
  MoyenPaiement,
  Pays,
  Personne,
  RegimeTva, ModeLivraison, TypePalette, BasePaiement, BaseTarif, TypeCamion, Transitaire, Entrepot
} from '../../../../shared/models';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-entrepot-details',
  templateUrl: './entrepot-details.component.html',
  styleUrls: ['./entrepot-details.component.scss']
})
export class EntrepotDetailsComponent implements OnInit {

  entrepotForm = this.fb.group({
    id: [''],
    code: [''],
    raisonSocial: [''],
    societe: [''],
    adresse1: [''],
    adresse2: [''],
    adresse3: [''],
    codePostal: [''],
    ville: [''],
    pays: [''],
    incoterm: [''],
    regimeTva: [''],
    tvaCee: [''],
    instructSecrComm: [''],
    instructLogistique: [''],
    idTVA: [''],
    typePalette: [''],
    mentionClientFacture: [''],
    transporteur: [''],
    baseTarifTransport: [''],
    PUTarifTransport: [''],
    typeCamion: [''],
    transitaire: [''],
    baseTarifTransit: [''],
    PUTarifTransit: [''],
    modeLivraison: [''],
    langue: [''],
    commercial: [''],
    assistante: [''],
    controleRefClient: [''],
    declarationEUR1: [''],
    envoiAutoDetail: [''],
    gestionnaireCHEP: [''],
    referenceCHEP: [''],
    lieuFonctionEANDepot: [''],
    lieuFonctionEANAcheteur: [''],
    valide: [false],
    modeLivraison: [''],
    typePalette: [''],
    mentionClientFacture: [''],
    transporteur: [''],
    transitaire: [''],
    typeCamion: [''],
    PUTarifTransport: [''],
    instructLogistique: [''],
    controleRefClient: [''],
    instructSecrComm: [''],
    envoiAutoDetail: [''],
    declarationEUR1: [''],
    referenceCHEP: [''],
    gestionnaireCHEP: [''],
    PUTarifTransit: [''],
    baseTarifTransit: [''],
    baseTarifTransport: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  entrepot: Entrepot;
  pays: Pays[];
  code: string;
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: MoyenPaiement[];
  regimeTva: RegimeTva[];
  incoterm: Incoterm[];
  modesLivraison: ModeLivraison[];
  typesPalette: TypePalette[];
  baseTarifsTransport: BaseTarif[];
  typesCamion: TypeCamion[];
  transitaires: Transitaire[];
  baseTarifsTransit: BaseTarif[];
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
        this.entrepot = c;
        this.entrepotForm.patchValue(this.entrepot);
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

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/entrepots/${this.entrepot.id}`]);
  }
}
