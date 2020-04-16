import {Component, OnInit, OnDestroy} from '@angular/core';
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
import { Subscription } from 'rxjs';

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
    lieuFonctionEAN: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  private queryGetOneTransporteur: Subscription;

  transporteur: Transporteur;
  secteurs: Secteur[];
  pays: Pays[];
  code: string;
  commerciaux: Personne[];
  assistantes: Personne[];
  devises: Devise[];
  moyenPaiements: MoyenPaiement[];
  basePaiements: BasePaiement[];
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
    this.queryGetOneTransporteur = this.transporteursService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.transporteur = res.data.transporteur;
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

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/transporteurs/${this.transporteur.id}`]);
  }

  ngOnDestroy() {
    this.queryGetOneTransporteur.unsubscribe();
  }

}
