import {Component, OnInit} from '@angular/core';
import { EntrepotsService } from '../../../../shared/services/entrepots.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Entrepot } from '../../../../shared/models';
import { FormBuilder } from '@angular/forms';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { PersonnesService } from 'app/shared/services/personnes.service';
import { ModesLivraisonService } from 'app/shared/services/modes-livraison.service';
import { PaysService } from 'app/shared/services/pays.service';
import { TypesPaletteService } from 'app/shared/services/types-palette.service';
import { IncotermsService } from 'app/shared/services/incoterms.service';
import { RegimesTvaService } from 'app/shared/services/regimes-tva.service';
import { TransporteursService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/bases-tarif.service';
import { TypesCamionService } from 'app/shared/services/types-camion.service';
import { TransitairesService } from 'app/shared/services/transitaires.service';

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
    typePalette: [''],
    mentionClientSurFacture: [''],
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
    lieuFonctionEanDepot: [''],
    lieuFonctionEanAcheteur: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

  code: string;
  entrepot: Entrepot;
  personnes: DataSource;
  modesLivraison: DataSource;
  typesPalette: DataSource;
  pays: DataSource;
  incoterms: DataSource;
  regimesTva: DataSource;
  transporteurs: DataSource;
  basesTarif: DataSource;
  typesCamion: DataSource;
  transitaires: DataSource;
  defaultVisible: boolean;

  constructor(
    private fb: FormBuilder,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private modesLivraisonService: ModesLivraisonService,
    private paysService: PaysService,
    private typesPaletteService: TypesPaletteService,
    private incotermsService: IncotermsService,
    private regimesTvaService: RegimesTvaService,
    private transporteursService: TransporteursService,
    private basesTarifService: BasesTarifService,
    private typesCamionService: TypesCamionService,
    private transitairesService: TransitairesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.defaultVisible = false;
  }

  ngOnInit() {
    this.entrepotsService
    .getOne(this.route.snapshot.paramMap.get('id'))
    .subscribe( res => {
      this.entrepot = res.data.entrepot;
      this.entrepotForm.patchValue(this.entrepot);
    });
    this.personnes = this.personnesService.getDataSource();
    this.modesLivraison = this.modesLivraisonService.getDataSource();
    this.pays = this.paysService.getDataSource();
    this.typesPalette = this.typesPaletteService.getDataSource();
    this.incoterms = this.incotermsService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.transporteurs = this.transporteursService.getDataSource();
    this.basesTarif = this.basesTarifService.getDataSource();
    this.typesCamion = this.typesCamionService.getDataSource();
    this.transitaires = this.transitairesService.getDataSource();
  }

  debug(test) {
    console.log(test);
  }

  onSubmit() {
    if (!this.entrepotForm.pristine && this.entrepotForm.valid) {
      const entrepot = this.entrepotsService
      .extractDirty(this.entrepotForm.controls);
      this.entrepotsService
      .save({ entrepot: { ...entrepot, id: this.entrepot.id } })
      .subscribe({
        next: () => notify('Sauvegardé', 'success', 3000),
        error: () => notify('Echec de la sauvegarde', 'error', 3000),
      });
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/entrepots/${this.entrepot.id}`]);
  }
}
