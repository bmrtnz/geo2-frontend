import {Component, OnInit, AfterViewInit, EventEmitter, ViewChild} from '@angular/core';
import { EntrepotsService, ClientsService } from '../../../../shared/services';
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
import { NestedPart } from 'app/pages/nested/nested.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-entrepot-details',
  templateUrl: './entrepot-details.component.html',
  styleUrls: ['./entrepot-details.component.scss']
})
export class EntrepotDetailsComponent implements OnInit, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
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
    valide: [false],
    preSaisie: ['']
  });
  helpBtnOptions = { icon: 'help', elementAttr: { id: 'help-1' }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  editing = false;

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
  isReadOnlyMode = true;
  createMode = false;
  preSaisie: string;
  mandatoryCode: boolean;

  constructor(
    private fb: FormBuilder,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
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

  get readOnlyMode() {
    return this.isReadOnlyMode;
  }
  set readOnlyMode(value: boolean) {
    this.editing = !value;
    this.isReadOnlyMode = value;
  }

  ngAfterViewInit(): void {
    this.formGroup.reset();
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector('.submit') as HTMLElement;
      Element.click();
    }
  }

  ngOnInit() {

    this.route.params
    .pipe(tap( _ => this.formGroup.reset()))
    .subscribe(params => {
      const url = this.route.snapshot.url;
      this.createMode = url[url.length - 2].path === 'create';
      this.readOnlyMode = !this.createMode;
      if (!this.createMode) {
        this.entrepotsService
          .getOne(params.id)
          .subscribe( res => {
            this.entrepot = res.data.entrepot;
            this.formGroup.patchValue(this.entrepot);
            this.contentReadyEvent.emit();
            this.preSaisie = this.entrepot.preSaisie === true ? 'preSaisie' : '';
          });
      } else {
        this.entrepot = new Entrepot({});
        this.clientsService.getOne(this.route.snapshot.params.client).subscribe(
          result => {
            // On reprend le code client (si pas existant) pour le code entrepôt
            // ainsi que les autres infos liées au client
            const code = result.data.client.code.toUpperCase();
            const entrepotsSource = this.entrepotsService.getDataSource({ search: `code=="${ code }"` });
            entrepotsSource.load().then(res => {
              if (!res.length) {
                this.mandatoryCode = true;

                const fields = ['code', 'commercial', 'assistante', 'raisonSocial',
                 'adresse1', 'adresse2', 'adresse3', 'codePostal', 'ville', 'pays',
                 'langue', 'tvaCee', 'typePalette', 'incoterm', 'regimeTva',
                 'transporteur']
                this.entrepot.envoieAutomatiqueDetail = result.data.client.detailAutomatique;
                this.entrepot.lieuFonctionEanDepot = result.data.client.lieuFonctionEan;

                for (const field of fields) {
                  this.entrepot[field] = result.data.client[field];
                }

                this.formGroup.patchValue(this.entrepot);
              }
             });
            }
        );
        this.contentReadyEvent.emit();
      }
    });

    this.personnes = this.personnesService.getDataSource();
    this.modesLivraison = this.modesLivraisonService.getDataSource();
    this.pays = this.paysService.getDataSource({search: 'valide==true'});
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

    if (!this.formGroup.pristine && this.formGroup.valid) {
      const entrepot = this.entrepotsService.extractDirty(this.formGroup.controls);

      if (!this.createMode) {
        entrepot.id = this.entrepot.id;
        if (entrepot.valide === true) {
          entrepot.preSaisie = false;
          this.preSaisie = '';
        }
      } else {
        entrepot.code = this.formGroup.get('code').value.toUpperCase();
        entrepot.client = {id: this.route.snapshot.params.client};
        entrepot.valide = false;
        entrepot.preSaisie = true;
      }

      this.entrepotsService
      .save({ entrepot })
        .subscribe({
          next: (e) => {
            notify('Sauvegardé', 'success', 3000);
            if (!this.createMode) {
              this.entrepot = { id: this.entrepot.id, ...this.formGroup.getRawValue() };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/tiers/entrepots/${e.data.saveEntrepot.id}`]);
            }
          },
          error: () => notify('Echec de la sauvegarde', 'error', 3000),
        });
    }

  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.entrepot);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/tiers/entrepots`]);
    }
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${ this.entrepot.code }/${ this.entrepot.typeTiers }`]);
  }

}
