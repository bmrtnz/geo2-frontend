import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  BaseTarif,
  CodePromo,
  Fournisseur,
  TypePalette
} from "app/shared/models";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  FournisseursService,
  LocalizationService
} from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CodesPromoService } from "app/shared/services/api/codes-promo.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { GridCommandesEventsService } from "app/shared/services/grid-commandes-events.service";
import {
  Grid,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { DxoLoadPanelComponent } from "devextreme-angular/ui/nested";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { from, iif, lastValueFrom, Observable, of } from "rxjs";
import {
  concatMap,
  concatMapTo, filter,
  finalize, last,
  map,
  takeWhile,
  tap
} from "rxjs/operators";
import { ArticleCertificationPopupComponent } from "../article-certification-popup/article-certification-popup.component";
import { ArticleOriginePopupComponent } from "../article-origine-popup/article-origine-popup.component";
import { ArticleReservationOrdrePopupComponent } from "../article-reservation-ordre-popup/article-reservation-ordre-popup.component";
import { GridsService } from "../grids.service";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ZoomFournisseurPopupComponent } from "../zoom-fournisseur-popup/zoom-fournisseur-popup.component";

let self: GridCommandesComponent; // thank's DX
@Component({
  selector: "app-grid-commandes",
  templateUrl: "./grid-commandes.component.html",
  styleUrls: ["./grid-commandes.component.scss"],
})
export class GridCommandesComponent
  implements OnInit, OnChanges, AfterViewInit {
  constructor(
    public injector: Injector,
    private gridConfigurator: GridConfiguratorService,
    public ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
    private fournisseursService: FournisseursService,
    private basesTarifService: BasesTarifService,
    private gridUtilsService: GridUtilsService,
    private codesPromoService: CodesPromoService,
    private formUtilsService: FormUtilsService,
    private functionsService: FunctionsService,
    private typesPaletteService: TypesPaletteService,
    public localizeService: LocalizationService,
    private gridsService: GridsService,
    private stocksService: StocksService,
    private stockMouvementsService: StockMouvementsService,
    private gridCommandesEventsService: GridCommandesEventsService,
    private authService: AuthService
  ) {
    self = this;
    this.constructorFeatures();
  }

  public readonly FEATURE = {
    margePrevisionelle: true,
    columnCertifications: true,
    columnOrigine: true,
    highlightBio: true,
    rowOrdering: true,
    quickSwitch: true,
    reportDLUO: true,
    destockage: true,
    indicateurStock: true,
    zoom: true,
  };

  private readonly lookupDisplayFields = [
    "proprietaireMarchandise.id",
    "proprietaireMarchandise.code",
    "proprietaireMarchandise.raisonSocial",
    "fournisseur.id",
    "fournisseur.code",
    "fournisseur.raisonSocial",
    "venteUnite.description",
    "codePromo.description",
    "achatUnite.description",
    "typePalette.description",
    "paletteInter.description",
    "fraisUnite.description",
  ];

  public readonly gridID = Grid.LignesCommandes;
  public columns: Observable<GridColumn[]>;
  public contentReadyEvent = new EventEmitter<any>();
  public fournisseursSource: DataSource;
  private fournisseurDisplayValueStore: { [id: number]: string } = {};

  @Input() ordre: Partial<Ordre>;
  @Input() venteACommission: boolean;
  @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;
  @ViewChild(DxoLoadPanelComponent) loadPanel: DxoLoadPanelComponent;
  @Output() allowMutations = false;
  @Output() updateDestockAuto = new EventEmitter<any>();
  @Output() afterSaved = new EventEmitter<any>();

  // legacy features properties
  public certifsMD: any;
  public certifMDDS: DataSource;
  public certificationText: string;
  public originText: string;
  public lastRowFocused: boolean;
  public gridRowsTotal: number;
  public currentfocusedRow: number;
  public currNumero: string;
  public switchNumero: string;
  public newArticles = 0;
  public nbInsertedArticles: number;
  public newNumero = 0;
  public hintDblClick: string;
  public proprietairesDataSource: DataSource;
  public embalExp: string[];
  private lastingRows: number;
  private reindexButton: any;


  @Output() public ordreLigne: OrdreLigne;
  @Output() swapRowArticle = new EventEmitter();
  @Output() public articleLigneId: string;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;
  @Output() priceChange = new EventEmitter();
  @Output() transporteurChange = new EventEmitter();
  @Output() selectedRowsChange = new EventEmitter();
  @ViewChild(ArticleCertificationPopupComponent)
  articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ArticleOriginePopupComponent)
  articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false })
  zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false })
  zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  @ViewChild(ArticleReservationOrdrePopupComponent, { static: false })
  reservationStockPopup: ArticleReservationOrdrePopupComponent;

  public gridConfigHandler = (event) =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: this.localizeService.localize("grid-title-lignes-cde"),
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
      toolbarItems: [
        {
          location: "after",
          widget: "dxButton",
          options: {
            icon: "sorted",
            hint: "Renuméroter les lignes",
            onClick: () => {
              this.reindexRows();
              this.grid.instance.refresh();
            },
            onInitialized: (args: any) => {
              this.reindexButton = args.component;
            },
          },
        },
      ],
    });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(filter((params) => params.has("ordre_id")))
      .subscribe({
        next: (params) => {
          this.ordre.id = params.get("ordre_id");
          this.updateRestrictions();
        },
      });
    this.columns = this.gridConfigurator.fetchColumns(this.gridID);
    this.hintDblClick = this.localizeService.localize("hint-dblClick-file");

    // wait until grid columns a ready
    this.contentReadyEvent
      .pipe(
        filter((event) => event.component.columnCount() !== 0),
        takeWhile((event) => event.component.columnCount() <= 5, true),
        last()
      )
      .subscribe((event) => {
        this.update();
        this.gridCommandesEventsService.updateContext(this.ordre.id).subscribe();
        this.bindSources(event.component);
      });

    if (this.FEATURE.columnCertifications) this.initFeatures();
  }

  onContentReady(e) {
    if (this.FEATURE.rowOrdering) this.handleNewArticles();
    this.grid.instance.deselectAll();
    this.gridRowsTotal = this.grid.instance.getVisibleRows()?.length;
    this.reindexButton.option("disabled", !this.gridRowsTotal);
    // Register all distinct fournisseurs (embal/exp)
    this.embalExp = [];
    if (this.grid.dataSource) {
      (this.grid.dataSource as DataSource)
        .items()
        .filter((ds) => ds.fournisseur)
        .map((ds) => this.embalExp.push(ds.fournisseur?.code));
      this.embalExp = [...new Set(this.embalExp)];
    }
  }

  onSelectionChanged(e) {
    this.selectedRowsChange.emit(this.grid?.instance.getSelectedRowKeys());
  }

  ngOnChanges() {
    if (this.ordre?.id) this.updateRestrictions();
  }

  ngAfterViewInit() {
    this.gridsService.register("Commande", this.grid, this.gridsService.orderIdentifier(this.ordre));
  }

  displaySummaryFormat(data) {
    if (!data?.value) return;
    return data.value + " ligne" + (data.value > 1 ? "s" : "");
  }

  destockEnded() {
    this.updateDestockAuto.emit();
  }

  onSaving(event: OnSavingEvent) {
    if (event.component.hasEditData()) {
      // Calculate margin at the end of the saving process
      // & refresh margin grid
      this.grid.instance.option("loadPanel.enabled", true);
      const saveInterval = setInterval(() => {
        if (!this.grid.instance.hasEditData()) {
          clearInterval(saveInterval);
          this.functionsService
            .fCalculMargePrevi(
              this.ordre?.id,
              this.currentCompanyService.getCompany().id
            )
            .subscribe({
              error: ({ message }: Error) => console.log(message),
              complete: () => this.gridsService.reload(["OrdreMarge"], this.gridsService.orderIdentifier(this.ordre)),
            });
        }
      }, 100);
    }
  }

  onSaved() {
    this.functionsService.fVerifLogistiqueOrdre(this.ordre?.id)
      .subscribe(() => this.gridsService.reload(["SyntheseExpeditions", "DetailExpeditions", "Logistique", "Frais"]));
    const firstLigneCommande = this?.grid?.instance?.getVisibleRows()?.[0]?.data;
    if (firstLigneCommande)
      this.functionsService
        .setTransporteurBassin(firstLigneCommande.id, firstLigneCommande.ordre.societe.id)
        .subscribe(() => this.afterSaved.emit());
    this.grid.instance.option("loadPanel.enabled", false);
  }

  // Reload grid data after external update
  public async update() {
    this.grid.instance.option("loadPanel.enabled", true);
    this.grid.instance.beginCustomLoading("");
    const datasource = await this.refreshData(
      await this.columns.toPromise()
    ).toPromise();
    this.grid.dataSource = datasource;
    await this.grid.instance.saveEditData();
    this.grid.instance.endCustomLoading();
    this.transporteurChange.emit();
    setTimeout(() => {
      this.reindexRows();
      this.gridsService.reload(["SyntheseExpeditions", "DetailExpeditions"], this.gridsService.orderIdentifier(this.ordre));
      this.grid.instance.option("loadPanel.enabled", false);
    }, 1000);
  }

  private onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.grid.instance.option("loadPanel.enabled", true);
    this.refreshData(current).subscribe((datasource) => {
      this.grid.dataSource = datasource;
      this.grid.instance.option("loadPanel.enabled", false);
    });
  }

  private refreshData(columns: GridColumn[]) {
    if (this.ordre?.id)
      return of(columns).pipe(
        GridConfiguratorService.getVisible(),
        GridConfiguratorService.getFields(),
        concatMap((fields) =>
          of(this.ordreLignesService.getPreloadedDataSource(
            [
              OrdreLigne.getKeyField() as string,
              // grid config + visible
              ...fields,

              // lookup display
              ...this.lookupDisplayFields,

              // extra features
              ...(this.FEATURE.columnCertifications
                ? ["listeCertifications"]
                : []),
              ...(this.FEATURE.columnOrigine
                ? ["article.matierePremiere.origine.id", "origineCertification"]
                : []),
              ...(this.FEATURE.highlightBio
                ? [
                  "article.matierePremiere.modeCulture.description",
                  "article.articleDescription.bio",
                ]
                : []),
              ...(this.FEATURE.zoom
                ? [
                  "article.id",
                  "proprietaireMarchandise.code",
                  "fournisseur.code",
                ]
                : []),
              ...(this.FEATURE.destockage
                ? [
                  "ordre.numero",
                  "ordre.entrepot.code",
                  "article.description",
                  "article.matierePremiere.variete.description",
                  "article.matierePremiere.origine.description",
                  "article.cahierDesCharge.categorie.description",
                  "article.normalisation.calibreMarquage.description",
                  "article.cahierDesCharge.coloration.description",
                  "article.cahierDesCharge.sucre.description",
                  "article.cahierDesCharge.penetro.description",
                  "article.normalisation.stickeur.description",
                  "article.cahierDesCharge.cirage.description",
                  "article.cahierDesCharge.rangement.description",
                  "article.emballage.emballage.descriptionTechnique",
                  "article.normalisation.etiquetteEvenementielle.description",
                  "article.normalisation.etiquetteColis.description",
                  "article.normalisation.etiquetteUc.description",
                  "article.emballage.conditionSpecial.description",
                  "article.emballage.alveole.description",
                  "article.normalisation.gtinUc",
                  "article.normalisation.gtinColis",
                  "article.gtinUcBlueWhale",
                  "article.gtinColisBlueWhale",
                  "article.normalisation.produitMdd",
                  "article.normalisation.articleClient",
                  "article.instructionStation",
                  "article.emballage.emballage.idSymbolique",
                  "article.matierePremiere.espece.id",
                  "nombreReservationsSurStock",
                ]
                : []),
              // Used to lock fields
              ...[
                "ordre.type.id",
                "ordre.societe.id",
                "ordre.venteACommission",
                "ordre.entrepot.modeLivraison",
                "ordre.commentaireUsageInterne",
                "indicateurPalette",
                "logistique.expedieStation",
                "ordre.ordreEDI.id",
                "ordre.secteurCommercial.id",
                "ordre.bonAFacturer",
                "ordre.societe.id",
              ],
              // Used to filter emballeur/expediteur
              ...["proprietaireMarchandise.listeExpediteurs"],
              // Required by cell events
              ...[
                "typePalette.dimensions",
                "nombreColisPaletteByDimensions",
                "article.emballage.emballage.xb",
                "article.emballage.emballage.xh",
                "article.emballage.emballage.yb",
                "article.emballage.emballage.yh",
                "article.emballage.emballage.zb",
                "article.emballage.emballage.zh",
                "proprietaireMarchandise.natureStation",
                "fournisseur.devise.id",
                "fournisseur.indicateurRepartitionCamion",
                "article.id",
                "article.matierePremiere.variete.id",
                "article.cahierDesCharge.categorie.id",
                "article.cahierDesCharge.categorie.cahierDesChargesBlueWhale",
                "article.matierePremiere.origine.id",
                "article.matierePremiere.modeCulture.id",
              ]
            ],
            this.ordreLignesService.mapDXFilterToRSQL([
              ["ordre.id", "=", this.ordre?.id],
            ])
          ))
        ),
      );
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordre?.id });
    this.allowMutations = !isCloture;
  }

  /**
   * Recalculate rows numero and push changes
   */
  private reindexRows(startIndex?: number, endIndex?: number) {

    if (this.lastingRows) return;

    const inclusive = (index: number) => index + 1;
    const datasource = this.grid.dataSource as DataSource;
    if (!datasource) return;
    this.grid.instance.beginCustomLoading(this.localizeService.localize("reindexing"));
    const items = datasource.items();
    const lignes = items
      .slice(startIndex, endIndex ? inclusive(endIndex) : items.length)
      .map(({ id }) => id);
    this.ordreLignesService
      .reindex(lignes, ["id", "numero"])
      .pipe(
        concatMap((res) => from(res.data.reindex)),
        finalize(() => this.grid.instance.endCustomLoading())
      )
      .subscribe(({ id, numero }) =>
        datasource.store().push([
          {
            key: id,
            type: "update",
            data: { numero },
          },
        ])
      );
  }

  private async buildFournisseurFilter(proprietaireID?: Fournisseur["id"]) {
    const filters = [];

    const proprietaire = await this.fournisseursService
      .getOne_v2(proprietaireID, [
        "id",
        "code",
        "raisonSocial",
        "listeExpediteurs",
      ])
      .pipe(map((res) => res.data.fournisseur))
      .toPromise();
    if (
      this.currentCompanyService.getCompany().id !== "BUK" ||
      proprietaire?.code.substring(0, 2) !== "BW"
    ) {
      const listExp = proprietaire?.listeExpediteurs?.split(",");
      if (listExp?.length) {
        for (const exp of listExp) {
          filters.push(["code", "=", exp], "or");
        }

        filters.pop();
      } else {
        if (proprietaire.id !== null)
          filters.push(["id", "=", proprietaire.id]);
      }
    }
    return filters;
  }

  // legacy features methods

  constructorFeatures() {
    this.certificationText = this.injector
      .get(LocalizationService)
      .localize("btn-certification");
    this.originText = this.injector
      .get(LocalizationService)
      .localize("btn-origine");
  }

  initFeatures() {
    this.certifMDDS = this.injector
      .get(CertificationsModesCultureService)
      .getDataSource_v2(["id", "description", "type"], 100);
    this.certifMDDS.filter(["type", "=", "CERTIF"]);
    this.certifMDDS.load().then((res) => {
      this.certifsMD = res; // Store certifications Mode culture
    });
  }

  showCertificationCheck(data) {
    let isCert = false;
    if (data.listeCertifications) {
      // Already recorded
      this.certifsMD?.map((certType) => {
        if (
          data.listeCertifications?.split(",").includes(certType.id.toString())
        )
          isCert = true;
      });
    } else {
      // Default certifications from customer file
      isCert = this.ordre?.client?.certifications?.length > 0;
    }
    return this.certificationText + (isCert ? " ✓" : "");
  }

  async openDestockagePopup(ligne) {
    await this.gridsService.waitUntilAllGridDataSaved(self?.grid);
    if (!this.allowMutations) return;
    this.ordreLigne = ligne;
    const current = `${ligne.fournisseur?.code ?? "-"} / ${ligne.proprietaireMarchandise?.code ?? "-"
      }`;
    const showConfirm = (resas: LigneReservation[]) =>
      of(resas).pipe(
        concatMap((res) =>
          confirm(
            `ligne affectée a ${current} et réservations sur ${res[0].fournisseurCode} / ${res[0].proprietaireCode},
        le programme va supprimer les réservations actives sur ${res[0].fournisseurCode}`,
            "Attention"
          )
        ),
        filter((res) => res),
        concatMapTo(
          this.stockMouvementsService.deleteAllByOrdreLigneId(ligne.id)
        )
      );
    this.stocksService
      .allLigneReservationList(ligne.id)
      .pipe(
        map((res) => res.data.allLigneReservationList),
        concatMap((res) =>
          iif(
            () =>
              !!res.length &&
              res[0].fournisseurCode !== ligne.fournisseur?.code,
            showConfirm(res),
            of(true)
          )
        )
      )
      .subscribe(() => (this.reservationStockPopup.visible = true));
  }

  openCertificationPopup(ligne) {
    this.ordreLigne = ligne;
    this.articleCertificationPopup.visible = true;
  }

  showOriginButton(cell) {
    return cell.data.article.matierePremiere.origine.id === "F";
  }

  showOriginCheck(data) {
    return this.originText + (data.origineCertification ? " ✓" : "");
  }

  openOriginePopup(ligne) {
    this.ordreLigne = ligne;
    this.articleOriginePopup.visible = true;
  }

  onCellClick() {
    self = this; // KEEP THIS to have a consistent value of 'self' when navigating through order tabs
  }

  onFocusedCellChanging(e) {
    const dataField = e.columns[e.newColumnIndex].dataField;
    const proprietaireID = e.rows[e.newRowIndex].data.proprietaireMarchandise?.id;
    if (proprietaireID && dataField === "fournisseur.id")
      this.buildFournisseurFilter(proprietaireID).then(
        (filters) => {
          // La colonne "fournisseur" n'utilise pas un `lookup` comme composant
          // car il ne possede pas de fonctionnalité de filtrage de données
          // Et la reassignation dynamique de celui ci cause des problemes de performances sur la navigation
          // Nous utilisons donc une implementation personnalisée d'une `select-box`
          // avec laquelle le filtrage de la source de données est possible
          this.fournisseursSource.filter(filters);
        }
      );
  }

  setCellValue(newData: Partial<OrdreLigne>, value, currentData: Partial<OrdreLigne>) {
    const context: any = this;

    if (context.dataField === "proprietaireMarchandise.id") {
      return self.gridCommandesEventsService
        .onProprietaireMarchandiseChange(newData, value, currentData, self.grid.instance)
        .then(() => lastValueFrom(self.fournisseursService
          .getOne_v2(newData.proprietaireMarchandise?.id ?? currentData.proprietaireMarchandise?.id, [
            "id",
            "code",
            "raisonSocial",
            "listeExpediteurs",
          ]).pipe(map((res) => res.data.fournisseur)))
        )
        .then(async proprietaire => {
          if (newData?.fournisseur) return;
          const listeExpediteurs = proprietaire?.listeExpediteurs?.split(",");
          if (listeExpediteurs?.length) {
            for (const exp of listeExpediteurs)
              // Automatically selected when included in the list
              if (exp === proprietaire.code) newData.fournisseur = proprietaire;

            // Select first on the list if no selection
            const firstFournisseur = await lastValueFrom(self.fournisseursService
              .getFournisseurByCode(listeExpediteurs[0], ["id", "code", "raisonSocial"])
              .pipe(map((res) => res.data.fournisseurByCode)));
            newData.fournisseur = newData?.fournisseur ?? firstFournisseur;
          } else newData.fournisseur = proprietaire;
        });
    } else if (context.dataField === "fournisseur.id") {
      return self.gridCommandesEventsService
        .onFournisseurChange(newData, value, currentData, self.grid.instance);
    } else if (context.dataField === "nombrePalettesCommandees") {
      return self.gridCommandesEventsService
        .onNombrePalettesCommandeesChange(newData, value, currentData);
    } else if (context.dataField === "nombrePalettesIntermediaires") {
      return self.gridCommandesEventsService
        .onNombrePalettesIntermediairesChange(newData, value, currentData, self.grid.instance);
    } else if (context.dataField === "nombreColisPalette") {
      return self.gridCommandesEventsService
        .onNombreColisPaletteChange(newData, value, currentData, self.grid.instance);
    } else if (context.dataField === "nombreColisCommandes") {
      return self.gridCommandesEventsService
        .onNombreColisCommandesChange(newData, value, currentData, self.grid.instance);
    } else if (context.dataField === "ventePrixUnitaire") {
      return self.gridCommandesEventsService
        .onVentePrixUnitaireChange(newData, value, currentData);
    } else if (context.dataField === "gratuit") {
      return self.gridCommandesEventsService
        .onGratuitChange(newData, value, currentData);
    } else if (context.dataField === "achatDevisePrixUnitaire") {
      return self.gridCommandesEventsService
        .onAchatDevisePrixUnitaireChange(newData, value, currentData);
    } else if (context.dataField === "typePalette.id") {
      return self.gridCommandesEventsService
        .onTypePaletteChange(newData, value, currentData, self.grid.instance);
    } else if (context.dataField === "paletteInter.id") {
      return self.gridCommandesEventsService
        .onPaletteInterChange(newData, value, currentData);
    } else {
      // default behavior
      context.defaultSetCellValue(newData, value);
    }
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (
        [
          "article.articleDescription.descriptionReferenceLongue",
          "article.articleDescription.descriptionReferenceCourte",
        ].includes(e.column?.dataField)
      ) {
        e.cellElement.title = e.value + "\r\n" + this.hintDblClick;
        e.cellElement.classList.add("cursor-pointer");
        // Bio en vert
        if (e.data.article.articleDescription.bio)
          e.cellElement.classList.add("bio-article");
      }
      // Taux encombrement
      if (e.column.dataField === "nombrePalettesCommandees") {
        let tauxEncombrement;
        if (e.data.nombreColisPalette && e.data.nombreColisCommandes) {
          tauxEncombrement =
            e.data.nombreColisCommandes / e.data.nombreColisPalette;
          tauxEncombrement /= e.data.nombrePalettesIntermediaires
            ? e.data.nombrePalettesIntermediaires + 1
            : 1;
          e.cellElement.title =
            tauxEncombrement + "\r\n(Taux encombrement au sol)";
        }
      }
      // Tooltip prix achat
      if (e.column.dataField === "achatDevisePrixUnitaire") {
        if (e.data.achatDeviseTaux)
          e.cellElement.title = `Taux : ${e.data.achatDeviseTaux}\r\nP.U. : ${e.data.achatPrixUnitaire}`;
      }
    }
  }

  onDataChanged(data: Partial<OrdreLigne>) {
    const ds = this.grid.dataSource as DataSource;
    const store = ds.store() as CustomStore;
    store.push([{ key: data.id, type: "update", data }]);
  }

  onFocusedRowChanged(e) {
    this.currentfocusedRow = e.row?.rowIndex;
    this.lastRowFocused = this.currentfocusedRow === this.gridRowsTotal - 1;
  }

  async deleteArticles() {
    if (await confirm(
      this.localizeService.localize("text-popup-supprimer-lignes"),
      this.localizeService.localize("grid-title-lignes-cde")
    )) {
      // Looping through rows
      const rowsToDelete = this.grid.instance.getSelectedRowKeys();
      const finalRows = this.grid.instance.getVisibleRows().length - rowsToDelete.length;
      rowsToDelete.map(k => this.grid.instance.deleteRow(this.grid.instance.getRowIndexByKey(k)))
      this.grid.instance.saveEditData();
      this.grid.instance.beginCustomLoading("");
      // Preventing reindexing before all rows are removed
      let secureLoop = 0;
      const saveInterval = setInterval(() => {
        secureLoop++;
        this.lastingRows = this.grid.instance.getVisibleRows().length - finalRows;
        if (!this.lastingRows || secureLoop === 500) {
          clearInterval(saveInterval);
          this.grid.instance.endCustomLoading();
          if (finalRows) {
            setTimeout(() => {
              this.reindexRows();
              this.grid.instance.refresh();
            }, 2100);
          } else {
            this.grid.instance.refresh();
          }
        }
      }, 100);
    } else {
      notify(this.localizeService.localize("delete-canceled"), "warning", 1500);
    }
  }

  onReorder(e: {
    component: dxDataGrid;
    itemData: Partial<OrdreLigne>; // dragged item
    fromIndex: number;
    toIndex: number;
  }) {
    const source = self.grid.dataSource as DataSource;
    const sorted = source.items().map(({ id }) => id);
    sorted.splice(e.toIndex, 0, sorted.splice(e.fromIndex, 1)[0]);
    self.grid.instance.beginCustomLoading(self.localizeService.localize("reindexing"));
    self.ordreLignesService
      .reindex(sorted, ["id", "numero"])
      .pipe(
        concatMap((res) => from(res.data.reindex)),
        finalize(() => {
          // estimated wait for source changed
          setTimeout(() => {
            self.grid.instance.columnOption("numero", "sortOrder", "desc");
            self.grid.instance.columnOption("numero", "sortOrder", "asc");
            self.grid.instance.endCustomLoading();
          }, 2000);
        })
      )
      .subscribe(({ id, numero }) =>
        source.store().push([
          {
            key: id,
            type: "update",
            data: { numero },
          },
        ])
      );
  }

  handleNewArticles() {
    // Grid is loaded with new articles: save order row numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + " ";
      info +=
        " " +
        this.injector.get(LocalizationService).localize("article-ajoutes");
      info = info.split("&&").join(this.nbInsertedArticles > 1 ? "s" : "");
      notify(info, "success", 3000);
      this.injector.get(GridUtilsService).resetGridScrollBar(this.grid);
      this.newArticles = 0;
      this.newNumero = 0;
      this.nbInsertedArticles = null;
      this.grid.instance.option("focusedRowIndex", this.gridRowsTotal); // Focus on 1st added item
      this.grid.instance.saveEditData();
    }
  }

  onEditorPreparing(e) {
    // KEEP THIS !!! See secureTypedValueWithEditGrid() comment
    if (e.parentType === "dataRow") {
      e.editorOptions.onInput = (elem) => {
        this.gridUtilsService.secureTypedValueWithEditGrid(elem);
      };
    }
    // Optimizing lookup dropdown list width
    if (e.editorName === "dxSelectBox") {
      e.editorOptions.onOpened = (elem) =>
        elem.component._popup.option("width", 300);
    }
    // Customize `fournisseur` column
    if (e.parentType == "dataRow" && e.dataField == "fournisseur.id") {
      e.editorName = "dxSelectBox";
      e.editorOptions.searchTimeout = 0;
      e.editorOptions.valueExpr = "id";
      e.editorOptions.searchExpr = ["code"];
      e.editorOptions.dataSource = this.fournisseursSource;
      e.editorOptions.displayExpr = rowData => {
        const displayValue = rowData?.code ? `${rowData?.code} - ${rowData?.raisonSocial}` : "";
        if (rowData?.id)
          this.fournisseurDisplayValueStore[rowData.id] = displayValue;
        return displayValue;
      };
      e.editorOptions.onValueChanged = args => e.setValue(args.value);
    }
  }

  calculateFournisseurDisplayValue(rowData) {
    if (self.fournisseurDisplayValueStore?.[rowData.fournisseur?.id])
      return self.fournisseurDisplayValueStore?.[rowData.fournisseur?.id];
    return rowData.fournisseur?.id ? `${rowData.fournisseur?.code} - ${rowData.fournisseur?.raisonSocial}` : "";
  }

  onEditorPrepared(e) {
    // Define new order rows numbers
    if (
      e.dataField === "numero" &&
      this.newArticles < this.nbInsertedArticles
    ) {
      if (e.value === null) {
        this.newNumero++;
        const newNumero = this.createStringNumero(this.newNumero);
        e.component.cellValue(e.row.rowIndex, "numero", newNumero);
        this.newArticles++;
      } else {
        this.newNumero = parseInt(e.value, 10);
      }
    }
  }

  onEditingStart(e) {
    if (!e.column || !e.data.numero || !this.gridRowsTotal) return;
    this.ordreLignesService.lockFields(e, this.allowMutations);
  }

  createStringNumero(num) {
    return ("0" + num.toString()).slice(-2);
  }

  async swapArticle(cell) {
    await this.gridsService.waitUntilAllGridDataSaved(self?.grid);
    this.swapRowArticle.emit(cell.id);
  }

  copyPaste(e, field) {
    e.event.stopImmediatePropagation();
    let refValue;
    const rows = this.grid.instance.getVisibleRows();
    if (rows?.length < 2) return;
    rows.map((res, index) => {
      if (!index) {
        refValue = res.data.libelleDLV;
      } else {
        this.grid.instance.cellValue(res.rowIndex, field, refValue);
      }
    });
    setTimeout(() => this.grid.instance.saveEditData());
    notify("Report DLUO effectué", "success", 3000);
  }

  openFilePopup(e) {
    if (e.rowType !== "data") return;
    if (
      [
        "article.articleDescription.descriptionReferenceLongue",
        "article.articleDescription.descriptionReferenceCourte",
      ].includes(e.column?.dataField)
    ) {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (
      ["fournisseur.id", "proprietaireMarchandise.id"].includes(
        e.column?.dataField
      )
    ) {
      const { id: idFour, code } =
        this.grid.instance.getVisibleRows()[e.rowIndex].data[
        e.column.dataField.split(".")[0]
        ];
      if (idFour === null) return;
      this.fournisseurLigneId = idFour;
      this.fournisseurCode = code;
      this.zoomFournisseurPopup.visible = true;
    }
  }

  /** lookup columns datasource binding */
  private async bindSources(grid: dxDataGrid) {
    this.fournisseursSource = await this.fournisseursService.getPreloadedDatasource<Fournisseur>(
      ["id", "code", "raisonSocial", "listeExpediteurs", "indicateurRepartitionCamion"],
      this.fournisseursService.mapDXFilterToRSQL([["valide", "=", true]])
    );
    this.fournisseursSource.sort([{ selector: "code" }]);

    // With Fournisseur model
    GridConfiguratorService.bindLookupColumnSource(
      grid,
      "proprietaireMarchandise.id",
      await this.fournisseursService.getPreloadedLookupStore<Fournisseur>(
        ["id", "code", "raisonSocial", "listeExpediteurs"],
        this.fournisseursService.mapDXFilterToRSQL([
          ["valide", "=", true],
          "and",
          ["natureStation", "<>", "F"],
        ]),
        { sort: [{ selector: "code" }] }
      )
    );

    // With BaseTarif model
    const btFilter = this.basesTarifService.mapDXFilterToRSQL([
      ["valide", "=", true],
      "and",
      ["valideLig", "=", true],
    ]);
    const btLookupStore = this.basesTarifService.getLookupStore<BaseTarif>(
      ["id", "description"],
      btFilter
    );
    for (const field of ["venteUnite.id", "achatUnite.id", "fraisUnite.id"])
      GridConfiguratorService.bindLookupColumnSource(
        grid,
        field,
        btLookupStore
      );

    GridConfiguratorService.bindLookupColumnSource(
      grid,
      "codePromo.id",
      this.codesPromoService.getLookupStore<CodePromo>(["id", "description"])
    );

    // With TypePalette model
    const tpLookupStore = this.typesPaletteService.getLookupStore<TypePalette>(
      ["id", "description"],
      "valide==true"
    );
    for (const field of ["typePalette.id", "paletteInter.id"])
      GridConfiguratorService.bindLookupColumnSource(
        grid,
        field,
        tpLookupStore
      );
  }

  onKeyDown({ event }: { event: { originalEvent: KeyboardEvent } }) {
    if (event.originalEvent.code !== "Enter") return;
    const shiftModifier = event.originalEvent.shiftKey;
    this.grid.instance.closeEditCell();

    // Only act on lookup
    if (
      !this.grid.instance.columnOption(this.grid.focusedColumnIndex - 1)?.lookup
    )
      return;

    // switch focus
    this.grid.instance.focus(
      this.grid.instance.getCellElement(
        this.grid.focusedRowIndex + (shiftModifier ? -1 : 1),
        this.grid.focusedColumnIndex
      )
    );
  }

  onGridOut() {
    if (this.grid.instance.hasEditData())
      this.grid.instance.saveEditData();
  }
}
