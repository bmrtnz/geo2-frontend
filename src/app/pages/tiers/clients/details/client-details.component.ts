import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import { SecteursService } from 'app/shared/services/secteurs.service';
import DataSource from 'devextreme/data/data_source';
import { PersonnesService } from 'app/shared/services/personnes.service';
import { PaysService } from 'app/shared/services/pays.service';
import { TypesClientService } from 'app/shared/services/types-client.service';
import { IncotermsService } from 'app/shared/services/incoterms.service';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { DevisesService } from 'app/shared/services/devises.service';
import { MoyensPaiementService } from 'app/shared/services/moyens-paiement.service';
import { BasesPaiementService } from 'app/shared/services/bases-paiement.service';
import notify from 'devextreme/ui/notify';

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
    // agrement: [''],
    // public courtier: Courtier; // TODO
    courtageModeCalcul: [''],
    courtageValeur: [''],
    typeClient: [''],
    groupeClient: [''],
    soumisCtifl: [''],
    valide: [false],
    lieuFonctionEan: [''],
    delaiBonFacturer: [''],
    // certifications: [''],
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  client: Client;
  code: string;
  secteurs: DataSource;
  personnes: DataSource;
  pays: DataSource;
  typesClient: DataSource;
  incoterms: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  regimesTva: DataSource;
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
    private route: ActivatedRoute,
    // public localizePipe: LocalizePipe,
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {

    this.clientsService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.client = res.data.client;
      this.clientForm.patchValue(this.client);
    });

    this.secteurs = this.secteursService.getDataSource();
    this.personnes = this.personnesService.getDataSource();
    this.pays = this.paysService.getDataSource();
    this.typesClient = this.typesClientService.getDataSource();
    this.incoterms = this.incotermsService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();

  }

  debug(test: any) {
    console.log(test);
  }

  onSubmit() {
    if (!this.clientForm.pristine && this.clientForm.valid) {
      const client = this.clientsService
      .extractDirty(this.clientForm.controls);
      this.clientsService
      .save({ client: { ...client, id: this.client.id } })
      .subscribe({
        next: () => notify('Sauvegardé', 'success', 3000),
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
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

}
