import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, Courtier } from '../../../../shared/models';
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
import { TypesVenteService } from 'app/shared/services/types-vente.service';
import { CourtierService } from 'app/shared/services/courtiers.service';
import { GroupesClientService } from 'app/shared/services/groupes-vente.service';
import { BasesTarifService } from 'app/shared/services/bases-tarif.service';
import { ConditionsVenteService } from 'app/shared/services/conditions-vente.service';

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
    ifco: [''],
    instructionLogistique: [''],
    basePaiement: [''],
    compteComptable: [''],
    langue: [''],
    devise: [''],
    enCoursTemporaire: [''],
    enCoursBlueWhale: [''],
    fraisMarketing: [''],
    fraisPlateforme: [''],
    fraisExcluArticlePasOrigineFrance: [''],
    tauxRemiseParFacture: [''],
    tauxRemiseHorsFacture: [''],
    commercial: [''],
    assistante: [''],
    referenceCoface: [''],
    agrement: [''],
    courtageModeCalcul: [''],
    courtageValeur: [''],
    conditionVente: [''],
    typeClient: [''],
    typeVente: [''],
    groupeClient: [''],
    paloxRaisonSocial: [''],
    courtier: [''],
    soumisCtifl: [''],
    valide: [false],
    lieuFonctionEan: [''],
    delaiBonFacturer: [''],
    debloquerEnvoieJour: [''],
    clotureAutomatique: [''],
    fraisRamasse: [''],
    refusCoface: [''],
    enCoursDateLimite: [''],
    // certifications: [''],
    fraisMarketingModeCalcul: [''],
    formatDluo: [''],
    dateDebutIfco: [''],
    nbJourLimiteLitige: [''],
    detailAutomatique: [''],
    venteACommission: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  client: Client;
  code: string;
  gridBoxValue: number[];
  secteurs: DataSource;
  personnes: DataSource;
  pays: DataSource;
  typesClient: DataSource;
  incoterms: DataSource;
  devises: DataSource;
  moyensPaiement: DataSource;
  basesPaiement: DataSource;
  basesTarif: DataSource;
  typesVente: DataSource;
  groupesClient: DataSource;
  courtiers: DataSource;
  clients: DataSource;
  regimesTva: DataSource;
  defaultVisible: boolean;
  conditionsVente: DataSource;
  readOnlyMode = true;
  createMode = false;

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
    private typesVenteService: TypesVenteService,
    private courtiersService: CourtierService,
    private basesTarifService: BasesTarifService,
    private groupesClientService: GroupesClientService,
    private moyensPaiementService: MoyensPaiementService,
    private conditionsVenteService: ConditionsVenteService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {

    const suffix = this.route.snapshot.url[0].path;

    if (suffix !== 'create') {
      this.clientsService
      .getOne(this.route.snapshot.paramMap.get('id'))
      .subscribe( res => {
        this.client = res.data.client;
        this.clientForm.patchValue(this.client);
      });

    } else {
      this.createMode = true;
      this.readOnlyMode = false;

      // Apply default value
      this.client = new Client({
        soumisCtifl: false
      });
      this.clientForm.patchValue(this.client);
    }

    this.secteurs = this.secteursService.getDataSource();
    this.personnes = this.personnesService.getDataSource();
    this.pays = this.paysService.getDataSource();
    this.typesClient = this.typesClientService.getDataSource();
    this.incoterms = this.incotermsService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.devises = this.devisesService.getDataSource();
    this.moyensPaiement = this.moyensPaiementService.getDataSource();
    this.basesPaiement = this.basesPaiementService.getDataSource();
    this.typesVente = this.typesVenteService.getDataSource();
    this.groupesClient = this.groupesClientService.getDataSource();
    this.courtiers = this.courtiersService.getDataSource();
    this.clients = this.clientsService.getDataSource();
    this.basesTarif = this.basesTarifService.getDataSource();
    this.conditionsVente = this.conditionsVenteService.getDataSource();

  }

  private requiredFields = ['soumisCtifl'];

  onSubmit() {
    if (!this.clientForm.pristine && this.clientForm.valid) {
      const client = this.clientsService.extractDirty(this.clientForm.controls);

      if (!this.createMode) {
        client.id = this.client.id;
      } else {
        for (const f of this.requiredFields) {
          client[f] = this.clientForm.controls[f].value;
        }
        client.societe = { id: 'SA' };
      }

      this.clientsService
          .save({ client })
          .subscribe({
            next: () => {
              notify('Sauvegardé', 'success', 3000);
              this.client = { id: this.client.id, ...this.clientForm.getRawValue() };
              this.readOnlyMode = true;
            },
            error: () => notify('Echec de la sauvegarde', 'error', 3000),
          });
    }
  }

  onCancel() {
    this.clientForm.reset(this.client);
    this.readOnlyMode = true;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  entrepotsBtnClick() {
    this.router.navigate([`/tiers/entrepots/client/${ this.client.id }`]);
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.client.code }/${ this.client.typeTiers }`]);
  }

}
