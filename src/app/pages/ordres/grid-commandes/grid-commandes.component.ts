import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BaseTarif, CodePromo, Fournisseur, TypePalette } from "app/shared/models";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { FournisseursService, LocalizationService } from "app/shared/services";
import { BasesTarifService } from "app/shared/services/api/bases-tarif.service";
import { CertificationsModesCultureService } from "app/shared/services/api/certifications-modes-culture.service";
import { CodesPromoService } from "app/shared/services/api/codes-promo.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { Grid, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { Change, GridColumn, OnSavingEvent } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { DxoLoadPanelComponent } from "devextreme-angular/ui/nested";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid from "devextreme/ui/data_grid";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { EMPTY, from, iif, Observable, of, zip } from "rxjs";
import { concatMap, concatMapTo, filter, finalize, first, last, map, takeWhile } from "rxjs/operators";
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
  styleUrls: ["./grid-commandes.component.scss"]
})
export class GridCommandesComponent implements OnInit, OnChanges, AfterViewInit {

  constructor(
    public injector: Injector,
    private gridConfigurator: GridConfiguratorService,
    private ordresService: OrdresService,
    private ordreLignesService: OrdreLignesService,
    private route: ActivatedRoute,
    private currentCompanyService: CurrentCompanyService,
    private fournisseursService: FournisseursService,
    private basesTarifService: BasesTarifService,
    private gridUtilsService: GridUtilsService,
    private codesPromoService: CodesPromoService,
    private formUtilsService: FormUtilsService,
    private typesPaletteService: TypesPaletteService,
    public localizeService: LocalizationService,
    private gridsService: GridsService,
    private stocksService: StocksService,
    private stockMouvementsService: StockMouvementsService,
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

  public readonly gridID = Grid.LignesCommandes;
  public columns: Observable<GridColumn[]>;
  public changes: Change<Partial<OrdreLigne>>[] = [];
  public contentReadyEvent = new EventEmitter<any>();

  @Input() ordreID: string;
  @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;
  @ViewChild(DxoLoadPanelComponent) loadPanel: DxoLoadPanelComponent;
  @Output() allowMutations = false;
  @Output() updateDestockAuto = new EventEmitter<any>();

  // legacy features properties
  public certifsMD: any;
  public certifMDDS: DataSource;
  public ordre: Partial<Ordre>;
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
  public fournisseursDataSource: DataSource;
  public embalExp: string[];

  @Output() public ordreLigne: OrdreLigne;
  @Output() swapRowArticle = new EventEmitter();
  @Output() public articleLigneId: string;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;
  @Output() priceChange = new EventEmitter();
  @Output() transporteurChange = new EventEmitter();
  @Output() selectedRowsChange = new EventEmitter();
  @ViewChild(ArticleCertificationPopupComponent) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ArticleOriginePopupComponent) articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false }) zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  @ViewChild(ArticleReservationOrdrePopupComponent, { static: false }) reservationStockPopup: ArticleReservationOrdrePopupComponent;


  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: this.localizeService.localize("grid-title-lignes-cde"),
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
      toolbarItems: [{
        location: "after",
        widget: "dxButton",
        options: {
          icon: "sorted",
          hint: "Renuméroter les lignes",
          onClick: () => {
            this.reindexRows();
            this.grid.instance.saveEditData();
          },
        },
      }],
    })

  ngOnInit(): void {
    this.route.paramMap
      .pipe(filter(params => params.has("ordre_id")))
      .subscribe({
        next: params => {
          this.ordreID = params.get("ordre_id");
          this.updateRestrictions();
        },
      });
    this.columns = this.gridConfigurator.fetchColumns(this.gridID);
    this.hintDblClick = this.localizeService.localize("hint-dblClick-file");

    // wait until grid columns a ready
    this.contentReadyEvent
      .pipe(
        filter(event => event.component.columnCount() !== 0),
        takeWhile(event => event.component.columnCount() <= 5, true),
        last(),
      )
      .subscribe(event => this.bindSources(event.component));

    if (this.FEATURE.columnCertifications) this.initFeatures();
  }

  onContentReady(e) {
    if (this.FEATURE.rowOrdering) this.handleNewArticles();
    this.grid.instance.deselectAll();
    this.gridRowsTotal = this.grid.instance.getVisibleRows()?.length;
    // Register all distinct fournisseurs (embal/exp)
    this.embalExp = [];
    if (this.grid.dataSource) {
      (this.grid.dataSource as DataSource).items()
        .filter(ds => ds.fournisseur)
        .map(ds => this.embalExp.push(ds.fournisseur?.code));
      this.embalExp = [...new Set(this.embalExp)];
    }

  }

  onSelectionChanged(e) {
    this.selectedRowsChange.emit(this.grid?.instance.getSelectedRowKeys());
    this.grid?.instance.getSelectedRowKeys();
  }

  ngOnChanges() {
    if (this.ordreID) this.updateRestrictions();
  }

  ngAfterViewInit() {
    this.gridsService.register("Commande", this.grid);
  }

  displaySummaryFormat(data) {
    if (!data?.value) return;
    return data.value + " ligne" + (data.value > 1 ? "s" : "");
  }

  onFocusedCellChanging(e) {
    // from proprietaire to fournisseur
    if (
      e.columns[e.prevColumnIndex]?.dataField === "proprietaireMarchandise.id"
      && e.columns[e.newColumnIndex]?.dataField === "fournisseur.id"
    ) {
      const row = e.rows[e.newRowIndex];
      this.buildFournisseurFilter(row.data.proprietaireMarchandise.id)
        .then(({ filters }) => this.bindFournisseurSource(filters));
    } else
      if ((e.prevColumnIndex !== e.newColumnIndex)) {
        // Keep the setTimeout function in place!!!
        // It seems that not everything's really ready when event is triggered
        // Conclusion => without a timeOut, major risk of unsaved data!
        return setTimeout(() => this.grid.instance.saveEditData(), 10);
      }
  }

  destockEnded() {
    this.updateDestockAuto.emit();
  }

  onSaving(event: OnSavingEvent) {

    if (event.component.hasEditData()) {

      this.changes = this.splitPropChanges();
      event.cancel = true;
      return this.handleMutations();

    }
  }

  // Reload grid data after external update
  public async update() {
    this.grid.instance.beginCustomLoading("");
    const datasource = await this.refreshData(await this.columns.toPromise()).toPromise();
    this.grid.dataSource = datasource;
    await this.grid.instance.saveEditData();
    this.grid.instance.endCustomLoading();
    this.transporteurChange.emit();
    setTimeout(() => this.reindexRows(), 1000);
  }

  private onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.refreshData(current).subscribe(datasource => {
      this.grid.dataSource = datasource;
    });
  }

  private handleMutations() {

    if (!this.changes.length) return;

    const source = this.grid.dataSource as DataSource;
    const store = source.store() as CustomStore;
    const change = this.changes.shift();

    if (change.type === "remove") {
      return this.ordreLignesService.remove(change.key)
        .then(() => store.remove(change.key))
        .then(() => {
          store.push([change]);
          this.gridsService.reload("SyntheseExpeditions", "DetailExpeditions");
          setTimeout(() => this.reindexRows(), 200);
          return this.handleMutations();
        });
    }

    if (change.type === "update")
      return new Promise(async (rsv, rjt) => {

        /* tslint:disable-next-line:prefer-const */
        let [name, value] = Object.entries(change.data)[0];

        if (["ventePrixUnitaire", "achatPrixUnitaire"].includes(name))
          this.priceChange.emit();

        if (["fournisseur"].includes(name))
          this.transporteurChange.emit();

        // map object value
        if (typeof value === "object")
          value = value.id;

        // request mutation
        this.columns
          .pipe(
            GridConfiguratorService.getVisible(),
            GridConfiguratorService.getFields(),
            concatMap(fields => this.ordreLignesService.updateField(
              name,
              value,
              change.key,
              this.currentCompanyService.getCompany().id,
              ["id", ...fields],
            )),
            first(),
          )
          .subscribe({

            // build and push response data
            next: ({ data }) => {
              if (data.updateField) {
                store.push([change, {
                  key: data.updateField.id,
                  type: "update",
                  data: data.updateField,
                }]);
              }
            },

            // reject on error
            error: err => {
              notify(err.message.replace("Exception while fetching data (/updateField) : ", ""), "error", 7000);
              rjt(err);
            },

            complete: () => {
              rsv();
              if (name === "fournisseur")
                this.gridsService.reload("SyntheseExpeditions", "DetailExpeditions");
              this.handleMutations();
            },
          });
      });

    return Promise.resolve();

  }

  private refreshData(columns: GridColumn[]) {
    if (this.ordreID)
      return of(columns)
        .pipe(
          GridConfiguratorService.getVisible(),
          GridConfiguratorService.getFields(),
          concatMap(fields => this.ordreLignesService.getPreloadedDataSource([
            OrdreLigne.getKeyField() as string,
            // grid config + visible
            ...fields,

            // lookup display
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

            // extra features
            ...this.FEATURE.columnCertifications ? ["listeCertifications"] : [],
            ...this.FEATURE.columnOrigine ? [
              "article.matierePremiere.origine.id",
              "origineCertification",
            ] : [],
            ...this.FEATURE.highlightBio ? [
              "article.matierePremiere.modeCulture.description",
              "article.articleDescription.bio"
            ] : [],
            ...this.FEATURE.zoom ? [
              "article.id",
              "proprietaireMarchandise.code",
              "fournisseur.code",
            ] : [],
            ...this.FEATURE.destockage ? [
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
            ] : [],
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
            ...[
              "proprietaireMarchandise.listeExpediteurs",
            ]
          ], this.ordreLignesService.mapDXFilterToRSQL([
            ["ordre.id", "=", this.ordreID]
          ]))),
        );
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordreID });
    this.allowMutations = !isCloture;
  }

  /**
   * Recalculate rows numero and push changes
   */
  private reindexRows(startIndex?: number, endIndex?: number) {
    const inclusive = (index: number) => index + 1;
    const datasource = this.grid.dataSource as DataSource;
    if (!datasource) return;
    this.grid.instance.beginCustomLoading("reindexing");
    const items = datasource.items();
    const lignes = items
      .slice(startIndex, endIndex ? inclusive(endIndex) : items.length)
      .map(({ id }) => id);
    this.ordreLignesService
      .reindex(lignes, ["id", "numero"])
      .pipe(
        concatMap(res => from(res.data.reindex)),
        finalize(() => this.grid.instance.endCustomLoading()),
      )
      .subscribe(({ id, numero }) => datasource.store().push([{
        key: id,
        type: "update",
        data: { numero },
      }]));
  }

  private async buildFournisseurFilter(proprietaireID?: Fournisseur["id"]) {

    let fournisseur: Partial<Fournisseur>;
    const filters = [];

    const proprietaire = await this.fournisseursService
      .getOne_v2(proprietaireID, ["id", "code", "raisonSocial", "listeExpediteurs"])
      .pipe(
        map(res => res.data.fournisseur),
      ).toPromise();

    if (
      this.currentCompanyService.getCompany().id !== "BUK"
      || proprietaire?.code.substring(0, 2) !== "BW"
    ) {
      const listExp = proprietaire?.listeExpediteurs?.split(",");
      if (listExp?.length) {
        for (const exp of listExp) {
          filters.push(["code", "=", exp], "or");
          // Automatically selected when included in the list
          if (exp === proprietaire.code) fournisseur = proprietaire;
        }

        // Select first on the list if no selection
        const firstFournisseur = await this.fournisseursService
          .getFournisseurByCode(listExp[0], ["id", "code", "raisonSocial"])
          .pipe(map(res => res.data.fournisseurByCode))
          .toPromise();
        fournisseur = fournisseur ?? firstFournisseur;

        filters.pop();
      } else {
        fournisseur = proprietaire;
        if (proprietaire.id !== null)
          filters.push(["id", "=", proprietaire.id]);
      }
    }
    return { filters, fournisseur };

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
    this.certifMDDS.load().then(res => {
      this.certifsMD = res; // Store certifications Mode culture
    });
  }

  showCertificationCheck(data) {
    let isCert = false;
    if (data.listeCertifications) { // Already recorded
      this.certifsMD?.map(certType => {
        if (data.listeCertifications?.split(",").includes(certType.id.toString()))
          isCert = true;
      });
    } else { // Default certifications from customer file
      isCert = this.ordre?.client?.certifications?.length > 0;
    }
    return this.certificationText + (isCert ? " ✓" : "");
  }

  openDestockagePopup(ligne) {
    if (!this.allowMutations) return;
    this.ordreLigne = ligne;
    const current = `${ligne.fournisseur?.code ?? "-"} / ${ligne.proprietaireMarchandise?.code ?? "-"}`;
    const showConfirm = (resas: LigneReservation[]) => of(resas).pipe(
      concatMap(res => confirm(
        `ligne affectée a ${current} et réservations sur ${res[0].fournisseurCode} / ${res[0].proprietaireCode},
        le programme va supprimer les réservations actives sur ${res[0].fournisseurCode}`,
        "Attention",
      )),
      filter(res => res),
      concatMapTo(this.stockMouvementsService.deleteAllByOrdreLigneId(ligne.id)),
    );
    this.stocksService.allLigneReservationList(ligne.id).pipe(
      map(res => res.data.allLigneReservationList),
      concatMap(res =>
        iif(
          () => !!res.length && res[0].fournisseurCode !== ligne.fournisseur?.code,
          showConfirm(res),
          of(true),
        ),
      ),
    ).subscribe(() => this.reservationStockPopup.visible = true);
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

  setCellValue(newData, value, currentData) {
    const context: any = this;

    if (context.dataField === "proprietaireMarchandise.id") {

      return zip(
        self.fournisseursService
          .getOne_v2(value, ["id", "code", "raisonSocial"])
          .pipe(map(res => res.data.fournisseur)),
        self.buildFournisseurFilter(value),
      )
        .pipe(
          concatMap(([proprietaire, { fournisseur }]) => {
            newData.proprietaireMarchandise = proprietaire;

            // newData.fournisseur = fournisseur;
            const rowIndex = self.grid.instance.getRowIndexByKey(currentData.id);
            self.grid.instance.cellValue(rowIndex, "fournisseur.id", fournisseur.id);

            // On force la bonne valeur pour l'affichage au focus
            const ds = self.grid.dataSource as DataSource;
            const store = ds.store() as CustomStore;
            store.push([{
              key: currentData.id,
              type: "update",
              data: { fournisseur } as Partial<OrdreLigne>,
            }]);

            return EMPTY;
          }),
        )
        .toPromise();

    } else if (context.dataField === "fournisseur.id") {
      return self.fournisseursService
        .getOne_v2(value, ["id", "code", "raisonSocial"])
        .pipe(concatMap(res => {
          newData.fournisseur = res.data.fournisseur;
          return EMPTY;
        }))
        .toPromise();
    } else {
      // default behavior
      context.defaultSetCellValue(newData, value);
    }

  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if ([
        "article.articleDescription.descriptionReferenceLongue",
        "article.articleDescription.descriptionReferenceCourte"]
        .includes(e.column?.dataField)) {
        e.cellElement.title = e.value + "\r\n" + this.hintDblClick;
        e.cellElement.classList.add("cursor-pointer");
        // Bio en vert
        if (e.data.article.articleDescription.bio) e.cellElement.classList.add("bio-article");
      }
      // Taux encombrement
      if (e.column.dataField === "nombrePalettesCommandees") {
        let tauxEncombrement;
        if (e.data.nombreColisPalette && e.data.nombreColisCommandes) {
          tauxEncombrement = e.data.nombreColisCommandes / e.data.nombreColisPalette;
          tauxEncombrement /= (e.data.nombrePalettesIntermediaires ? e.data.nombrePalettesIntermediaires + 1 : 1);
          e.cellElement.title = tauxEncombrement + "\r\n(Taux encombrement au sol)";
        }
      }
      // Tooltip prix achat
      if (e.column.dataField === "achatDevisePrixUnitaire") {
        if (e.data.achatDeviseTaux) e.cellElement.title = `Taux : ${e.data.achatDeviseTaux}\r\nP.U. : ${e.data.achatPrixUnitaire}`;
      }
    }
  }

  onDataChanged(data: Partial<OrdreLigne>) {
    const ds = this.grid.dataSource as DataSource;
    const store = ds.store() as CustomStore;
    store.push([{ key: data.id, type: "update", data }]);
  }

  onFocusedRowChanged(e) {
    // this.gridRowsTotal = this.grid.instance.getVisibleRows().length;
    this.currentfocusedRow = e.row?.rowIndex;
    this.lastRowFocused = (this.currentfocusedRow === (this.gridRowsTotal - 1));
  }

  onReorder(e: {
    component: dxDataGrid,
    itemData: Partial<OrdreLigne>, // dragged item
    fromIndex: number,
    toIndex: number,
  }) {

    const source = self.grid.dataSource as DataSource;
    const sorted = source.items().map(({ id }) => id);
    sorted.splice(e.toIndex, 0, sorted.splice(e.fromIndex, 1)[0]);
    self.grid.instance.beginCustomLoading("reindexing");
    self.ordreLignesService
      .reindex(sorted, ["id", "numero"])
      .pipe(
        concatMap(res => from(res.data.reindex)),
        finalize(() => {
          // estimated wait for source changed
          setTimeout(() => {
            self.grid.instance.columnOption("numero", "sortOrder", "desc");
            self.grid.instance.columnOption("numero", "sortOrder", "asc");
            self.grid.instance.endCustomLoading();
          }, 2000);
        }),
      )
      .subscribe(({ id, numero }) => source.store().push([{
        key: id,
        type: "update",
        data: { numero },
      }]));
  }

  handleNewArticles() {
    // Grid is loaded with new articles: save order row numbers
    if (this.newArticles === this.nbInsertedArticles) {
      let info = this.nbInsertedArticles + " ";
      info += " " + this.injector.get(LocalizationService).localize("article-ajoutes");
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
      e.editorOptions.onOpened = (elem) => elem.component._popup.option("width", 300);
    }
  }

  onEditorPrepared(e) {
    // Define new order rows numbers
    if (e.dataField === "numero" && this.newArticles < this.nbInsertedArticles) {
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
    this.ordreLignesService.lockFields(e);
  }

  createStringNumero(num) {
    return ("0" + num.toString()).slice(-2);
  }

  swapArticle(cell) {
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
    if ([
      "article.articleDescription.descriptionReferenceLongue",
      "article.articleDescription.descriptionReferenceCourte"]
      .includes(e.column?.dataField)) {
      this.articleLigneId = e.data.article.id;
      this.zoomArticlePopup.visible = true;
    }
    if (["fournisseur.id", "proprietaireMarchandise.id"].includes(e.column?.dataField)) {
      const { id: idFour, code } = this.grid.instance.getVisibleRows()[e.rowIndex].data[e.column.dataField.split(".")[0]];
      if (idFour === null) return;
      this.fournisseurLigneId = idFour;
      this.fournisseurCode = code;
      this.zoomFournisseurPopup.visible = true;
    }
  }

  /** lookup columns datasource binding */
  private async bindSources(grid: dxDataGrid) {

    // With Fournisseur model
    GridConfiguratorService
      .bindLookupColumnSource(grid, "proprietaireMarchandise.id", await this.fournisseursService
        .getPreloadedLookupStore<Fournisseur>(
          ["id", "code", "raisonSocial", "listeExpediteurs"],
          this.fournisseursService.mapDXFilterToRSQL([
            ["valide", "=", true],
            "and",
            ["natureStation", "<>", "F"],
          ]),
          { sort: [{ selector: "code" }] },
        ));
    this.bindFournisseurSource();

    // With BaseTarif model
    const btFilter = this.basesTarifService.mapDXFilterToRSQL([
      ["valide", "=", true],
      "and",
      ["valideLig", "=", true]
    ]);
    const btLookupStore = this.basesTarifService
      .getLookupStore<BaseTarif>(["id", "description"], btFilter);
    for (const field of ["venteUnite.id", "achatUnite.id", "fraisUnite.id"])
      GridConfiguratorService.bindLookupColumnSource(grid, field, btLookupStore);

    GridConfiguratorService.bindLookupColumnSource(
      grid,
      "codePromo.id",
      this.codesPromoService.getLookupStore<CodePromo>(["id", "description"]),
    );

    // With TypePalette model
    const tpLookupStore = this.typesPaletteService
      .getLookupStore<TypePalette>(["id", "description"], "valide==true");
    for (const field of ["typePalette.id", "paletteInter.id"])
      GridConfiguratorService.bindLookupColumnSource(
        grid,
        field,
        tpLookupStore,
      );
  }

  private async bindFournisseurSource(dxFilter?: any[]) {
    const filters: any[] = [["valide", "=", true]];
    if (dxFilter) filters.push("and", dxFilter);

    GridConfiguratorService
      .bindLookupColumnSource(this.grid.instance, "fournisseur.id", await this.fournisseursService
        .getPreloadedLookupStore<Fournisseur>(
          ["id", "code", "raisonSocial", "listeExpediteurs"],
          this.fournisseursService.mapDXFilterToRSQL(filters),
          { sort: [{ selector: "code" }] },
        ));
  }

  splitPropChanges() {
    const fournisseurChanges = [];
    const mappedChanges = this.changes.map(change => {

      // on ne s'occupe que des cas de mise a jour
      if (change.type !== "update") return change;

      // on decoupe les changements sur le cas proprietaire/fournisseur
      const properties = Object.keys(change.data);
      if (properties.includes("fournisseur") && properties.includes("proprietaireMarchandise")) {

        // on pousse le changement sur le fournisseur
        const fournisseur = JSON.parse(JSON.stringify(change));
        delete fournisseur.data.proprietaireMarchandise;
        fournisseurChanges.push(fournisseur);

        // on retire la propriété fournisseur sur le changement en cours
        delete change.data.fournisseur;

      }
      return change;
    });

    // on fusionne les changements
    return [...mappedChanges, ...fournisseurChanges];
  }

  onKeyDown({ event }: { event: { originalEvent: KeyboardEvent } }) {
    if (event.originalEvent.code !== "Enter") return;
    const shiftModifier = event.originalEvent.shiftKey;
    this.grid.instance.closeEditCell();

    // Only act on lookup
    if (!this.grid.instance.columnOption(this.grid.focusedColumnIndex - 1)?.lookup) return;

    // switch focus
    this.grid.instance.focus(this.grid.instance.getCellElement(
      this.grid.focusedRowIndex + (shiftModifier ? -1 : 1),
      this.grid.focusedColumnIndex
    ));
  }

}
