import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NestedPart } from "app/pages/nested/nested.component";
import { EditingAlertComponent } from "app/shared/components/editing-alert/editing-alert.component";
import { FileManagerComponent } from "app/shared/components/file-manager/file-manager-popup.component";
import { PushHistoryPopupComponent } from "app/shared/components/push-history-popup/push-history-popup.component";
import { ViewDocument } from "app/shared/components/view-document-popup/view-document-popup.component";
import { Editable } from "app/shared/guards/editing-guard";
import { Article } from "app/shared/models";
import Document from "app/shared/models/document.model";
import {
  ArticlesService,
  AuthService,
  LocalizationService,
} from "app/shared/services";
import { AlveolesService } from "app/shared/services/api/alveoles.service";
import { CalibresMarquageService } from "app/shared/services/api/calibres-marquage.service";
import { CalibresUnifiesService } from "app/shared/services/api/calibres-unifies.service";
import { CategoriesService } from "app/shared/services/api/categories.service";
import { CiragesService } from "app/shared/services/api/cirages.service";
import { ColorationsService } from "app/shared/services/api/colorations.service";
import { ConditionsSpecialesService } from "app/shared/services/api/conditions-speciales.service";
import { EmballagesService } from "app/shared/services/api/emballages.service";
import { EspecesService } from "app/shared/services/api/especes.service";
import { EtiquettesColisService } from "app/shared/services/api/etiquettes-colis.service";
import { EtiquettesEvenementiellesService } from "app/shared/services/api/etiquettes-evenementielles.service";
import { EtiquettesUcService } from "app/shared/services/api/etiquettes-uc.service";
import { HistoryType } from "app/shared/services/api/historique.service";
import { IdentificationsSymboliquesService } from "app/shared/services/api/identifications-symboliques.service";
import { MarquesService } from "app/shared/services/api/marques.service";
import { ModesCultureService } from "app/shared/services/api/modes-culture.service";
import { OriginesService } from "app/shared/services/api/origines.service";
import { PenetrosService } from "app/shared/services/api/penetros.service";
import { RangementsService } from "app/shared/services/api/rangements.service";
import { StickeursService } from "app/shared/services/api/stickeurs.service";
import { SucresService } from "app/shared/services/api/sucres.service";
import { TypesVenteService } from "app/shared/services/api/types-vente.service";
import { TypesService } from "app/shared/services/api/types.service";
import { ValidationService } from "app/shared/services/api/validation.service";
import { VarietesService } from "app/shared/services/api/varietes.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import gridsConfig from "assets/configurations/grids.json";
import { DxAccordionComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { StatistiquesArticlePopupComponent } from "../statistiques/statistiques-article-popup.component";

@Component({
  selector: "app-articles",
  templateUrl: "./article-details.component.html",
  styleUrls: ["./article-details.component.scss"],
})
export class ArticleDetailsComponent
  implements OnInit, NestedPart, Editable, OnChanges {
  @Input() public articleLigneId: string;

  formGroup = this.fb.group({
    id: [""],
    description: [""],
    blueWhaleStock: [""],
    valide: [""],
    preSaisie: [""],
    gtinColisBlueWhale: [""],
    gtinUcBlueWhale: [""],
    articleAssocie: [""],
    matierePremiere: this.fb.group({
      espece: [""],
      variete: [""],
      type: [""],
      modeCulture: [""],
      origine: [""],
      calibreUnifie: [""],
      typeVente: [""],
      codePlu: [""],
    }),
    cahierDesCharge: this.fb.group({
      instructionStation: [""],
      coloration: [""],
      categorie: [""],
      sucre: [""],
      penetro: [""],
      cirage: [""],
      rangement: [""],
    }),
    normalisation: this.fb.group({
      stickeur: [""],
      marque: [""],
      etiquetteColis: [""],
      etiquetteUc: [""],
      etiquetteEvenementielle: [""],
      gtinColis: [""],
      gtinUc: [""],
      produitMdd: [""],
      articleClient: [""],
      calibreMarquage: [""],
      identificationSymbolique: [""],
    }),
    emballage: this.fb.group({
      emballage: this.fb.group({
        id: [""],
        description: [""],
        tare: [""],
        xh: [""],
        xb: [""],
        yh: [""],
        yb: [""],
        dimension: [""],
        codeEan: [""],
        codeEanUc: [""],
        hauteurMaximumPalette: [""],
        consigne: [""],
        prixUnitaireMainOeuvre: [""],
        prixUnitaireMatierePremiere: [""],
        codeEmbadif: [""],
        valide: [""],
        groupe: this.fb.group({
          id: [""],
          description: [""],
        }),
        preEmballage: this.fb.group({
          id: [""],
          description: [""],
        }),
      }),
      conditionSpecial: [""],
      alveole: [""],
      uniteParColis: [""],
      prepese: [""],
      poidsNetColis: [""],
      poidsNetClient: [""],
      poidsNetGaranti: [""],
    }),
    // poidsNetUC: [''],
    // descrSpecialeCalClt: [''],
  });
  contentReadyEvent = new EventEmitter<any>();
  refreshGrid = new EventEmitter();
  @ViewChild(EditingAlertComponent, { static: true })
  alertComponent: EditingAlertComponent;
  @ViewChild(FileManagerComponent, { static: false })
  fileManagerComponent: FileManagerComponent;
  @ViewChild(PushHistoryPopupComponent, { static: false }) validatePopup: PushHistoryPopupComponent;
  @ViewChildren(DxAccordionComponent) accordion: any;
  @ViewChild(StatistiquesArticlePopupComponent, { static: false }) statsPopup: StatistiquesArticlePopupComponent;
  editing = false;
  public ucBW: boolean;

  article: Article;

  especes: DataSource;
  varietes: DataSource;
  types: DataSource;
  modesCulture: DataSource;
  origines: DataSource;
  calibresUnifies: DataSource;
  calibresMarquage: DataSource;
  colorations: DataSource;
  typesVente: DataSource;
  stickeurs: DataSource;
  marques: DataSource;
  emballages: DataSource;
  conditionsSpecials: DataSource;
  alveoles: DataSource;
  categories: DataSource;
  sucres: DataSource;
  penetros: DataSource;
  cirages: DataSource;
  rangements: DataSource;
  etiquettesColis: DataSource;
  etiquettesUc: DataSource;
  etiquettesEvenementielle: DataSource;
  identificationsSymboliques: DataSource;
  validateCommentPromptVisible = false;
  readOnlyMode = true;
  cloneMode = false;
  preSaisie: string;
  UC = false;
  CNUFCode: string;
  warningMode = false;
  palettesConfig: any;

  etiquetteVisible = false;
  currentEtiquette: ViewDocument;

  id: string;

  constructor(
    private articlesService: ArticlesService,
    private especesService: EspecesService,
    private varietesService: VarietesService,
    private typesService: TypesService,
    private modesCultureService: ModesCultureService,
    private originesService: OriginesService,
    private calibresUnifiesService: CalibresUnifiesService,
    private calibresMarquageService: CalibresMarquageService,
    private colorationsService: ColorationsService,
    private typesVenteService: TypesVenteService,
    private stickeursService: StickeursService,
    private marquesService: MarquesService,
    private emballagesService: EmballagesService,
    private conditionsSpecialesService: ConditionsSpecialesService,
    private alveolesService: AlveolesService,
    private categoriesService: CategoriesService,
    private sucresService: SucresService,
    private penetrosService: PenetrosService,
    private ciragesService: CiragesService,
    private rangementsService: RangementsService,
    private etiquettesColisService: EtiquettesColisService,
    private etiquettesUcService: EtiquettesUcService,
    private etiquettesEvenementiellesService: EtiquettesEvenementiellesService,
    private validationService: ValidationService,
    private identificationsSymboliquesService: IdentificationsSymboliquesService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private formUtils: FormUtilsService,
    public authService: AuthService,
    private localization: LocalizationService
  ) { }

  ngOnInit() {
    this.formGroup.reset();
    this.readOnlyMode = true;
    this.editing = false;
    this.cloneMode = false;

    if (this.route.snapshot.url[0]?.path !== "articles") return;

    this.route.params
      .pipe(switchMap((params) => this.articlesService.getOne(params.id)))
      .subscribe((res) => this.afterLoadInitForm(res));
  }

  ngOnChanges() {
    // Zoom article mode when clicking on an order article
    if (this.articleLigneId) {
      this.formGroup.reset();
      this.preSaisie = "";
      this.articlesService
        .getOne(this.articleLigneId)
        .subscribe((res) => this.afterLoadInitForm(res));
    }
  }

  openCloseAccordions(action) {
    if (!this.accordion) return;
    this.accordion.toArray().forEach((element) => {
      if (action) {
        element.instance.expandItem(0);
      } else {
        element.instance.collapseItem(0);
      }
    });
  }

  afterLoadInitForm(res) {
    this.article = new Article(res.data.article);
    this.formGroup.reset();
    this.formGroup.patchValue(this.article);
    this.contentReadyEvent.emit();
    this.ucBW = this.article.emballage.uniteParColis > 0;
    this.preSaisie = this.article.preSaisie === true ? "preSaisie" : "";
    this.palettesConfig = {
      palette80x120: "",
      palette60x80: "",
    };
    // Palette management
    const emb = this.article.emballage?.emballage;
    if (emb.xh)
      this.palettesConfig.palette100x120 = this.coucheColis(emb.xh, emb.xb);
    if (emb.yh)
      this.palettesConfig.palette80x120 = this.coucheColis(emb.yh, emb.yb);
    if (emb.zh)
      this.palettesConfig.palette60x80 = this.coucheColis(emb.zh, emb.zb);
    this.openCloseAccordions(!!this.articleLigneId); // When zooming
  }

  coucheColis(couche, colis) {
    return this.localization
      .localize("articles-emballage-couchesColis")
      .replace("&h", couche)
      .replace("&b", colis);
  }

  viewStats() {
    this.statsPopup.visible = true;
  }

  onCancel() {
    this.cloneMode = false;
    this.readOnlyMode = true;
    this.editing = false;
    this.formGroup.reset(this.article);
    this.openCloseAccordions(this.editing);
  }

  onEdit() {
    this.readOnlyMode = false;
    this.editing = true;
    this.showWarningsAccordions();
  }

  onClone() {
    this.readOnlyMode = false;
    this.cloneMode = true;
    this.editing = true;
    Object.keys(this.formGroup.controls).forEach((key) => {
      this.formGroup.get(key).markAsDirty();
    });
    this.showWarningsAccordions();
  }

  onUParColisChange(event) {
    this.ucBW = event.value > 0;
  }

  showWarningsAccordions() {
    // Seule solution valable pour le moment pour faire apparaitre les warnings. A revoir...
    this.warningMode = true;
    const Element = document.querySelector(".submit") as HTMLElement;
    Element.click();
    this.openCloseAccordions(this.editing);
  }

  displayIDBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  valueToUpperCase(e) {
    if (!e.component.option("value")) return;
    e.component.option("value", e.component.option("value").toUpperCase());
    return e.component.option("value");
  }

  onSubmit() {
    if (!this.formGroup.pristine && this.formGroup.valid && !this.warningMode) {
      const article = this.formUtils.extractDirty(
        this.formGroup.controls,
        Article.getKeyField()
      );

      // Special field: need to adjust data
      article.emballage.emballage = {
        id: article.emballage.emballage.id.id,
        espece: { id: this.article.matierePremiere.espece.id },
      };

      if (this.cloneMode) {
        article.preSaisie = true;
        article.valide = false;
      } else {
        if (article.valide === true) {
          article.preSaisie = false;
          this.preSaisie = "";
        }
      }

      (article.valide !== undefined &&
        this.article.valide !== article.valide &&
        !this.cloneMode
        ? this.validatePopup.present(HistoryType.ARTICLE, {
          article: { id: article.id },
          valide: article.valide,
        })
        : of(undefined)
      )
        .pipe(
          switchMap((_) =>
            this.articlesService.save_v2(this.getDirtyFieldsPath(), {
              article,
              clone: this.cloneMode,
            })
          )
        )
        .subscribe({
          next: (event) => {
            notify("Sauvegardé", "success", 3000);
            this.refreshGrid.emit();
            // Show red badges (unvalidated forms)
            this.validationService.showToValidateBadges();
            this.article = {
              ...this.article,
              ...this.formGroup.getRawValue(),
            };
            if (this.cloneMode) {
              this.router.navigate([
                `/pages/articles/${event.data.saveArticle.id}`,
              ]);
            }
            this.readOnlyMode = true;
            this.editing = false;
            this.article.historique = event.data.saveArticle.historique;
            this.formGroup
              .get("gtinColisBlueWhale")
              .patchValue(event.data.saveArticle.gtinColisBlueWhale);
            this.formGroup
              .get("gtinUcBlueWhale")
              .patchValue(event.data.saveArticle.gtinUcBlueWhale);
            this.formGroup.markAsPristine();
          },
          error: () => notify("Échec de la sauvegarde", "error", 3000),
        });
    }
    this.warningMode = false;
  }

  onEspeceChange(event) {
    const filter = event.value ? ["espece.id", "=", event.value.id] : [];

    this.especes = this.especesService.getDataSource();
    this.varietes = this.varietesService.getDataSource();
    this.varietes.filter(filter);
    this.types = this.typesService.getDataSource();
    this.types.filter(filter);
    this.modesCulture = this.modesCultureService.getDataSource();
    this.origines = this.originesService.getDataSource();
    this.origines.filter(filter);
    this.calibresUnifies = this.calibresUnifiesService.getDataSource();
    this.calibresUnifies.filter(filter);
    this.calibresMarquage = this.calibresMarquageService.getDataSource();
    this.calibresMarquage.filter(filter);
    this.colorations = this.colorationsService.getDataSource();
    this.colorations.filter(filter);
    this.typesVente = this.typesVenteService.getDataSource();
    this.stickeurs = this.stickeursService.getDataSource();
    this.stickeurs.filter(filter);
    this.marques = this.marquesService.getDataSource();
    this.marques.filter(filter);
    this.emballages = this.emballagesService.getDataSource();
    this.emballages.filter(filter);
    this.conditionsSpecials = this.conditionsSpecialesService.getDataSource();
    this.conditionsSpecials.filter(filter);
    this.alveoles = this.alveolesService.getDataSource();
    this.alveoles.filter(filter);
    this.categories = this.categoriesService.getDataSource();
    this.categories.filter(filter);
    this.sucres = this.sucresService.getDataSource();
    this.sucres.filter(filter);
    this.penetros = this.penetrosService.getDataSource();
    this.penetros.filter(filter);
    this.cirages = this.ciragesService.getDataSource();
    this.cirages.filter(filter);
    this.rangements = this.rangementsService.getDataSource();
    this.rangements.filter(filter);
    this.etiquettesColis = this.etiquettesColisService.getDataSource();
    this.etiquettesColis.filter(filter);
    this.etiquettesUc = this.etiquettesUcService.getDataSource();
    this.etiquettesUc.filter(filter);
    this.etiquettesEvenementielle =
      this.etiquettesEvenementiellesService.getDataSource();
    this.etiquettesEvenementielle.filter(filter);
    this.identificationsSymboliques =
      this.identificationsSymboliquesService.getDataSource();
    this.identificationsSymboliques.filter(filter);
  }

  fileManagerClick() {
    this.fileManagerComponent.visible = true;
  }

  async viewEtiquette(titleKey: string, document: Document) {
    this.currentEtiquette = {
      title: this.localization.localize(titleKey),
      document,
    };

    this.etiquetteVisible = true;
  }

  private getDirtyFieldsPath() {
    const dirtyFields = this.formUtils.extractDirty(
      this.formGroup.controls,
      Article.getKeyField()
    );

    const gridFields = gridsConfig.article.columns.map(
      ({ dataField }) => dataField
    );

    //     return [
    //       ...this.formUtils.extractPaths(dirtyFields),
    //       ...gridFields,
    //     ];

    const paths = [];

    Object.keys(dirtyFields).forEach((key) => {
      if (
        typeof this.formGroup.get(key).value === "object" &&
        this.formGroup.get(key).value !== null
      ) {
        Object.keys(this.formGroup.get(key).value).forEach((key2) => {
          const nestedVal = this.formGroup.get(`${key}.${key2}`).value;
          let controlKey;
          if (nestedVal !== null) {
            controlKey = `${key}.${key2}`;
            if (typeof nestedVal === "object" && nestedVal !== null)
              controlKey += "." + Object.keys(nestedVal)[0];
          }
          if (controlKey) paths.push(controlKey);
        });
      } else {
        paths.push(key);
      }
    });

    return [...paths, ...gridFields, "gtinColisBlueWhale", "gtinUcBlueWhale"];
  }
}
