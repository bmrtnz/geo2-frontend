import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NestedPart } from "app/pages/nested/nested.component";
import { EditingAlertComponent } from "app/shared/components/editing-alert/editing-alert.component";
import { ModificationListComponent } from "app/shared/components/modification-list/modification-list.component";
import { Editable } from "app/shared/guards/editing-guard";
import { Entrepot, Role, Client } from "app/shared/models";
import { AuthService, ClientsService, EntrepotsService, TransporteursService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { ModesLivraisonService } from "app/shared/services/api/modes-livraison.service";
import { ModificationsService } from "app/shared/services/api/modification.service";
import { PaysService } from "app/shared/services/api/pays.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { RegimesTvaService } from "app/shared/services/api/regimes-tva.service";
import { TransitairesService } from "app/shared/services/api/transitaires.service";
import { TypesCamionService } from "app/shared/services/api/types-camion.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { ValidationService } from "app/shared/services/api/validation.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { entrepot as entrepotsGridConfig } from "assets/configurations/grids.json";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { tap } from "rxjs/operators";
import { DxAccordionComponent } from "devextreme-angular";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

@Component({
  selector: "app-entrepot-details",
  templateUrl: "./entrepot-details.component.html",
  styleUrls: ["./entrepot-details.component.scss"]
})
export class EntrepotDetailsComponent implements OnInit, OnChanges, AfterViewInit, NestedPart, Editable {

  formGroup = this.fb.group({
    code: [""],
    client: [""],
    raisonSocial: [""],
    adresse1: [""],
    adresse2: [""],
    adresse3: [""],
    codePostal: [""],
    ville: [""],
    pays: [""],
    incoterm: [""],
    regimeTva: [""],
    tvaCee: [""],
    instructionSecretaireCommercial: [""],
    instructionLogistique: [""],
    typePalette: [""],
    mentionClientSurFacture: [""],
    transporteur: [""],
    baseTarifTransport: [""],
    prixUnitaireTarifTransport: [""],
    typeCamion: [""],
    transitaire: [""],
    baseTarifTransit: [""],
    prixUnitaireTarifTransit: [""],
    modeLivraison: [""],
    langue: [""],
    commercial: [""],
    assistante: [""],
    declarationTransit: [""],
    controlReferenceClient: [""],
    declarationEur1: [""],
    envoieAutomatiqueDetail: [""],
    gestionnaireChep: [""],
    referenceChep: [""],
    referenceIfco: [""],
    dateDebutIfco: [""],
    lieuFonctionEanDepot: [""],
    lieuFonctionEanAcheteur: [""],
    valide: [false],
    preSaisie: [""]
  });
  readonly inheritedFields = new Set([
    "id",
    "code",
    "client.id", "client.raisonSocial",
    "raisonSocial",
    "adresse1",
    "adresse2",
    "adresse3",
    "codePostal",
    "ville",
    "pays.id", "pays.description",
    "incoterm.id", "incoterm.description",
    "regimeTva.id", "regimeTva.description",
    "tvaCee",
    "instructionSecretaireCommercial",
    "instructionLogistique",
    "typePalette.id", "typePalette.description",
    "mentionClientSurFacture",
    "transporteur.id", "transporteur.raisonSocial",
    "baseTarifTransport.id", "baseTarifTransport.description",
    "prixUnitaireTarifTransport",
    "typeCamion.id", "typeCamion.description",
    "transitaire.id", "transitaire.raisonSocial",
    "baseTarifTransit.id", "baseTarifTransit.description",
    "prixUnitaireTarifTransit",
    "modeLivraison",
    "langue.id", "langue.description",
    "commercial.id", "commercial.nomUtilisateur",
    "assistante.id", "assistante.nomUtilisateur",
    "declarationTransit",
    "controlReferenceClient",
    "declarationEur1",
    "envoieAutomatiqueDetail",
    "gestionnaireChep",
    "referenceChep",
    "referenceIfco",
    "dateDebutIfco",
    "lieuFonctionEanDepot",
    "lieuFonctionEanAcheteur",
    "valide",
    "preSaisie",
    "typeTiers"
  ]);
  readonly inheritedClientFields = new Set([
    "id",
    "pays.id", "pays.description",
    "incoterm.id", "incoterm.description",
    "tvaCee"
  ]);
  refreshGrid = new EventEmitter();
  @Input() entrepotId: string;

  helpBtnOptions = { icon: "help", elementAttr: { id: "help-1" }, onClick: () => this.toggleVisible() };
  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(EditingAlertComponent, { static: true }) alertComponent: EditingAlertComponent;
  @ViewChild(ModificationListComponent, { static: false }) modifListe: ModificationListComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  editing = false;

  tempData: DataSource;
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
  ifcoChecked = false;
  idTvaRequired: boolean;
  preSaisie: string;
  client: Client;
  paysClientIdentique: boolean;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private entrepotsService: EntrepotsService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    private modificationsService: ModificationsService,
    private modesLivraisonService: ModesLivraisonService,
    private paysService: PaysService,
    private typesPaletteService: TypesPaletteService,
    public validationService: ValidationService,
    private incotermsService: IncotermsService,
    private regimesTvaService: RegimesTvaService,
    private transporteursService: TransporteursService,
    private basesTarifService: BasesTarifService,
    private typesCamionService: TypesCamionService,
    private transitairesService: TransitairesService,
    public currentCompanyService: CurrentCompanyService,
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

  ngOnChanges() {

    // Zoom entrepot mode
    if (this.entrepotId) {
      this.formGroup.reset();
      this.entrepotsService.getOne_v2(this.entrepotId, this.inheritedFields).subscribe((res) => {
        this.afterLoadInitForm(res);
      });
    }

  }

  ngOnInit() {


    this.commercial = this.personnesService.getDataSource();
    this.commercial.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
    ]);
    this.assistante = this.personnesService.getDataSource();
    this.assistante.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT],
    ]);

    this.modesLivraison = this.modesLivraisonService.getDataSource();
    this.pays = this.paysService.getDataSource_v2(["id", "description"]);
    this.pays.filter(["valide", "=", "true"]);
    this.typesPalette = this.typesPaletteService.getDataSource();
    this.typesPalette.filter(["valide", "=", "true"]);
    this.incoterms = this.incotermsService.getDataSource();
    this.incoterms.filter(["valide", "=", "true"]);
    this.regimesTva = this.regimesTvaService.getDataSource();
    this.regimesTva.filter(["valide", "=", "true"]);
    this.transporteurs = this.transporteursService.getDataSource_v2(["id", "raisonSocial", "ville"]);
    this.transporteurs.filter(["valide", "=", "true"]);
    this.basesTarif = this.basesTarifService.getDataSource();
    this.basesTarif.filter(["valide", "=", "true"]);
    this.typesCamion = this.typesCamionService.getDataSource();
    this.typesCamion.filter(["valide", "=", "true"]);
    this.transitaires = this.transitairesService.getDataSource();
    this.transitaires.filter(["valide", "=", "true"]);

    this.route.params
      .pipe(tap(_ => this.formGroup.reset()))
      .subscribe(params => {
        const url = this.route.snapshot.url;
        this.createMode = url[0].path === "create" || (url[2] ? url[2].path === "create" : false);
        this.readOnlyMode = !this.createMode;
        if (!this.createMode) {
          this.entrepotsService.getOne_v2(params.id, this.inheritedFields)
            .subscribe(res => {
              this.afterLoadInitForm(res);
            });
        } else {
          if (this.route.snapshot.params.client !== "null") {
            this.clientsService.getOne_v2(this.route.snapshot.params.client, this.inheritedClientFields)
              .subscribe(res => {
                this.client = res.data.client;
                if (this.client.incoterm) {
                  // Report incoterm client
                  this.formGroup.get("incoterm").patchValue(this.client.incoterm);
                }
              });
          }
          // Set current username if commercial
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([
            ["valide", "=", true], "and", ["role", "=", Role.COMMERCIAL],
            "and", ["nomUtilisateur", "=", this.authService.currentUser.nomUtilisateur]
          ]);
          this.tempData.load().then((res) => {
            if (res.length) {
              this.formGroup.get("commercial").setValue({ id: res[0].id });
              this.formGroup.get("commercial").markAsDirty();
            }
          });
          // Set current username if assistant(e)
          this.tempData = this.personnesService.getDataSource();
          this.tempData.filter([["valide", "=", true], "and", ["role", "=", Role.ASSISTANT],
            "and", ["nomUtilisateur", "=", this.authService.currentUser.nomUtilisateur]
          ]);
          this.tempData.load().then((res) => {
            if (res.length) {
              this.formGroup.get("assistante").setValue({ id: res[0].id });
              this.formGroup.get("assistante").markAsDirty();
            }
          });
          this.contentReadyEvent.emit();
        }
      });

  }

  afterLoadInitForm(res) {
    this.entrepot = res.data.entrepot;
    this.client = this.entrepot.client;
    this.formGroup.patchValue(this.entrepot);
    this.contentReadyEvent.emit();
    this.preSaisie = this.entrepot.preSaisie === true ? "preSaisie" : "";
    this.clientsService.getOne_v2(this.entrepot.client.id, this.inheritedClientFields)
      .subscribe(result => this.client = result.data.client);
  }

  ngAfterViewInit(): void {
    // Ouverture ou fermeture accordéons (création)
    this.openCloseAccordions(this.createMode);
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    if (this.createMode) {
      const Element = document.querySelector(".submit") as HTMLElement;
      Element.click();
    }
  }

  openCloseAccordions(action) {
    if (!this.accordion) return;
    this.accordion.toArray().forEach(element => {
      if (action) {
        element.instance.expandItem(0);
      } else {
        element.instance.collapseItem(0);
      }
    });
  }

  checkCode(params) {
    const code = params.value.toUpperCase();
    const entrepotsSource = this.entrepotsService.getDataSource_v2(["code"]);
    entrepotsSource.filter(["code", "=", code]);
    return entrepotsSource.load().then(res => !(res.length));
  }

  onCodeChange(e) {
    if (!e.value) return;
    this.formGroup.get("code").setValue(e.value.toUpperCase());
  }

  onIfcoChange(params) {
    this.ifcoChecked = params.value;
  }

  onChepRefChange(e) {
    const CHEP = "CHEP";
    if (e.value !== "") {
      this.formGroup.get("gestionnaireChep").patchValue(CHEP);
    } else {
      this.formGroup.get("gestionnaireChep").reset();
    }
    this.formGroup.get("gestionnaireChep").markAsDirty();
  }

  onPaysChange(e) {
    if (!this.editing || !this.client) return;
    this.idTvaRequired = ((e.value?.id !== this.client.pays?.id) && e.value?.id !== null);
  }

  onTvaCeeChange(e) {
    if (!this.editing || !this.client) return;
    // Checking that if different country idtva is also different
    const tvaClient = this.client.tvaCee;
    if (this.formGroup.get("pays").value && !this.paysClientIdentique && e.value && e.value === tvaClient) {
      this.formGroup.get("tvaCee").reset();
      if (e.element) notify("Id TVA - " + e.value + " - incorrect", "warning", 5000);
    }
  }

  valueToUpperCase(e) {
    if (!e.component.option("value")) return;
    e.component.option("value", e.component.option("value").toUpperCase());
    return e.component.option("value");
  }

  onNonRequiredSBChange(e) {
    if (this.editing && e.value === null) {
      this.formUtils.setIdToNull(this.formGroup, e.element.attributes.formcontrolname.nodeValue);
    }
  }

  onSubmit() {

    if (!this.formGroup.pristine && this.formGroup.valid) {
      // 11-2021: Lea/Stéphane wants to avoid pre-saisie/modifications step
      // if (this.formGroup.get("valide").value !== false || !this.formGroup.get("valide").dirty) {
      //     this.formGroup.get("valide").setValue(true);
      //     this.formGroup.get("valide").markAsDirty();
      // }
      this.formGroup.get("preSaisie").setValue(false);
      this.formGroup.get("preSaisie").markAsDirty();
      this.preSaisie = "";

      const entrepot = this.formUtils.extractDirty(this.formGroup.controls, Entrepot.getKeyField());

      if (!this.createMode) {
        entrepot.id = this.entrepot.id;
      } else {
        entrepot.societe = { id: this.currentCompanyService.getCompany().id };
        entrepot.client = { id: this.route.snapshot.params.client };
      }

      this.entrepotsService.save_v2(this.getDirtyFieldsPath(), { entrepot })
        .subscribe({
          next: (e) => {
            this.refreshGrid.emit();
            notify("Sauvegardé", "success", 3000);
            // Show red badges (unvalidated forms)
            this.validationService.showToValidateBadges();
            if (!this.createMode) {
              this.entrepot = {
                ...this.entrepot,
                ...this.formGroup.getRawValue(),
              };
              this.readOnlyMode = true;
            } else {
              this.editing = false;
              this.router.navigate([`/pages/tiers/entrepots/${e.data.saveEntrepot.id}`]);
            }
            if (this.entrepot) this.entrepot.typeTiers = e.data.saveEntrepot.typeTiers;
          },
          error: () => notify("Echec de la sauvegarde", "error", 3000),
        });
    }

  }

  onCancel() {
    if (!this.createMode) {
      this.formGroup.reset(this.entrepot);
      this.readOnlyMode = true;
    } else {
      this.router.navigate([`/pages/tiers/entrepots`]);
    }
  }

  displayIDBefore(data) {
    return data ? (data.id + " - " +
      (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description))) : null;
  }

  displayEntrepot(data) {
    return data ? data.id + " - " + data.raisonSocial + " (" + data.ville + ")" : null;
  }

  toggleVisible() {
    this.defaultVisible = !this.defaultVisible;
  }

  contactsBtnClick() {
    this.router.navigate([`/pages/tiers/contacts/${this.entrepot.code}/${this.entrepot.typeTiers}`]);
  }

  private getDirtyFieldsPath() {
    const dirtyFields = this.formUtils
      .extractDirty(this.formGroup.controls, Entrepot.getKeyField());
    const gridFields = entrepotsGridConfig.columns
      .map(({ dataField }) => dataField);

    return [
      ...this.formUtils.extractPaths(dirtyFields),
      ...gridFields,
    ];
  }

}
