import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedPart } from 'app/pages/nested/nested.component';
import { EditingAlertComponent } from 'app/shared/components/editing-alert/editing-alert.component';
import { Editable } from 'app/shared/guards/editing-guard';
import { AuthService, TransporteursService } from 'app/shared/services';
import { BasesTarifService } from 'app/shared/services/api/bases-tarif.service';
import { IncotermsService } from 'app/shared/services/api/incoterms.service';
import { ModesLivraisonService } from 'app/shared/services/api/modes-livraison.service';
import { PaysService } from 'app/shared/services/api/pays.service';
import { PersonnesService } from 'app/shared/services/api/personnes.service';
import { RegimesTvaService } from 'app/shared/services/api/regimes-tva.service';
import { TransitairesService } from 'app/shared/services/api/transitaires.service';
import { TypesCamionService } from 'app/shared/services/api/types-camion.service';
import { TypesPaletteService } from 'app/shared/services/api/types-palette.service';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { tap } from 'rxjs/operators';
import { Entrepot, Role } from 'app/shared/models';
import { ClientsService, EntrepotsService } from 'app/shared/services';
import { ModificationsService } from 'app/shared/services/api/modification.service';
import { ModificationListComponent } from 'app/shared/components/modification-list/modification-list.component';

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
    declarationTransit: [''],
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
  @ViewChild(ModificationListComponent, { static: false }) modifListe: ModificationListComponent;
  editing = false;

  entrepot: Entrepot;
  commercial: DataSource;
  assistante: DataSource;
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
 
  constructor(
    private fb: FormBuilder,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    private modificationsService: ModificationsService,
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
    private route: ActivatedRoute,
    public authService: AuthService,
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
      .pipe(tap(_ => this.formGroup.reset()))
      .subscribe(params => {
        const url = this.route.snapshot.url;
        this.createMode = url[0].path === 'create' || (url[2] ? url[2].path === 'create' : false);
        this.readOnlyMode = !this.createMode;
        if (!this.createMode) {
          this.entrepotsService.getOne(params.id)
            .subscribe(res => {
              this.entrepot = res.data.entrepot;
              this.formGroup.patchValue(this.entrepot);
              this.contentReadyEvent.emit();
              this.preSaisie = this.entrepot.preSaisie === true ? 'preSaisie' : '';
            });
        } else {
          this.entrepot = new Entrepot({});
          // In case we create from the full entrepots list (no associated client)
          if (this.route.snapshot.params.client !== 'null') {
            this.clientsService.getOne(this.route.snapshot.params.client)
              .subscribe(
                result => {
                  // On reprend le code client (si pas existant) pour le code entrepôt
                  const code = result.data.client.code.toUpperCase();
                  const entrepotsSource = this.entrepotsService.getDataSource_v2(['code']);
                  entrepotsSource.load().then(res => {
                    if (!res.length) {
                      this.entrepot.code = code;
                      this.formGroup.patchValue(this.entrepot);
                    }
                  });
                }
              );
          }
          this.contentReadyEvent.emit();
        }
      });

    this.commercial = this.personnesService.getDataSource();
    this.commercial.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.COMMERCIAL],
    ]);
    this.assistante = this.personnesService.getDataSource();
    this.assistante.filter([
      ['valide', '=', true],
      'and',
      ['role', '=', Role.ASSISTANT],
    ]);
    this.modesLivraison = this.modesLivraisonService.getDataSource();
    this.pays = this.paysService.getDataSource();
    this.pays.filter(['valide', '=', 'true']);
    this.typesPalette = this.typesPaletteService.getDataSource();
    this.incoterms = this.incotermsService.getDataSource();
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.transporteurs = this.transporteursService.getDataSource_v2(['id', 'raisonSocial']);
    this.basesTarif = this.basesTarifService.getDataSource();
    this.typesCamion = this.typesCamionService.getDataSource();
    this.transitaires = this.transitairesService.getDataSource();
  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const entrepotsSource = this.entrepotsService.getDataSource_v2(['code']);
    entrepotsSource.filter(['code', '=', code]);
    return entrepotsSource.load().then(res => !(res.length));
  }

  onCodeChange(e) {
    if (!e.value) return;
    this.formGroup.get('code').setValue(e.value.toUpperCase());
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
        entrepot.client = { id: this.route.snapshot.params.client };
        entrepot.valide = false;
        entrepot.preSaisie = true;
      }

      // Non-admin user : do not save, just record modifications
      if (!this.authService.currentUser.adminClient && !this.createMode) {
        this.readOnlyMode = true;
        this.editing = false;
        this.modificationsService
        .saveModifications(Entrepot.name, this.entrepot, this.formGroup, 'tiers-entrepots-')
        .subscribe(e => this.modifListe.refreshList());
      } else {

        this.entrepotsService.save({ entrepot })
          .subscribe({
            next: (e) => {
              notify('Sauvegardé', 'success', 3000);
              if (!this.createMode) {
                this.entrepot = {
                  ...this.entrepot,
                  ...this.formGroup.getRawValue(),
                };
                this.readOnlyMode = true;
              } else {
                this.editing = false;
                this.router.navigate([`/tiers/entrepots/${e.data.saveEntrepot.id}`]);
              }
              this.entrepot.typeTiers = e.data.saveEntrepot.typeTiers;
            },
            error: () => notify('Echec de la sauvegarde', 'error', 3000),
          });
        }
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

  displayIDBefore(data) {
    return data ? (data.id + ' ' + (data.nomUtilisateur ? data.nomUtilisateur : (data.raisonSocial ? data.raisonSocial : data.description))) : null;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/tiers/contacts/${this.entrepot.code}/${this.entrepot.typeTiers}`]);
  }

}
