import {Component, OnInit, AfterViewInit} from '@angular/core';
import { EntrepotsService } from '../../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Entrepot } from '../../../../shared/models';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
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
export class EntrepotDetailsComponent implements OnInit, AfterViewInit {

  entrepotForm = this.fb.group({
    code: [''],
    client: [''],
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
    instructionSecretaireCommercial: [''],
    instructionLogistique: [''],
    typePalette: [''],
    mentionClientSurFacture: [''],
    transporteur: [''],
    baseTarifTransport: [''],
    prixUnitaireTarifTransport: [''],
    typeCamion: [''],
    transitaire: [''],
    baseTarifTransit: [''],
    prixUnitaireTarifTransit: [''],
    modeLivraison: [''],
    langue: [''],
    commercial: [''],
    assistante: [''],
    controlReferenceClient: [''],
    declarationEur1: [''],
    envoieAutomatiqueDetail: [''],
    gestionnaireChep: [''],
    referenceChep: [''],
    lieuFonctionEanDepot: [''],
    lieuFonctionEanAcheteur: [''],
    valide: [false]
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };

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
  readOnlyMode = true;
  createMode = false;

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
    this.checkCode = this.checkCode.bind(this);
  }
  ngAfterViewInit(): void {
    this.entrepotForm.reset();
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.createMode = this.route.snapshot.url[0].path.includes('create');
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.entrepotsService
          .getOne(params.id)
          .subscribe( res => {
            this.entrepot = res.data.entrepot;
            this.entrepotForm.patchValue(this.entrepot);
          });
      } else {
        this.entrepot = new Entrepot({});
        // console.log(this.route.snapshot)
        // this.clientsService.getOne(this.route.snapshot.params.client).subscribe(
        //   res => {
        //     this.entrepot.client = res.data.client;
        //     console.log(this.entrepot)
        //     }
        // );
      }
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

  checkCode(params) {
      const code = params.value.toUpperCase();
      const entrepotsSource = this.entrepotsService.getDataSource({ search: `code=="${ code }"` });
      return entrepotsSource.load().then(res => !(res.length));
  }

  onSubmit() {

    if (!this.entrepotForm.pristine && this.entrepotForm.valid) {
      const entrepot = this.entrepotsService.extractDirty(this.entrepotForm.controls);

      if (!this.createMode) {
        entrepot.id = this.entrepot.id;
      } else {
        entrepot.code = this.entrepotForm.get('code').value.toUpperCase();
        entrepot.client = {id: this.route.snapshot.params.client};
      }

      this.entrepotsService
      .save({ entrepot })
        .subscribe({
          next: (e) => {
            notify('Sauvegardé', 'success', 3000);
            if (!this.createMode) {
              this.entrepot = { id: this.entrepot.id, ...this.entrepotForm.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.router.navigate([`/tiers/entrepots/${e.data.saveEntrepot.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
    }

  }

  onCancel() {
    if (!this.createMode) {
      this.entrepotForm.reset(this.entrepot);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/entrepots`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.entrepot.id }/${ this.entrepot.typeTiers }`]);
  }
}
