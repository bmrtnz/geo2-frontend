import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ColumnsSettings } from "app/shared/components/entity-cell-template/entity-cell-template.component";
import { Fournisseur } from "app/shared/models";
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
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import dxDataGrid, { dxDataGridColumn } from "devextreme/ui/data_grid";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { exit } from "process";
import { iif, Observable, of } from "rxjs";
import { concatMap, concatMapTo, filter, first, map, tap } from "rxjs/operators";
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
    this.filterFournisseurDS();
    this.proprietairesDataSource = this.fournisseursService
      .getDataSource_v2(["id", "code", "raisonSocial", "listeExpediteurs"]);
    this.proprietairesDataSource.filter([["valide", "=", true], "and", ["natureStation", "<>", "F"]]);
    const sharedBaseTarifDatasource = this.basesTarifService
      .getDataSource_v2(["id", "description"]);
    sharedBaseTarifDatasource.filter([
      ["valide", "=", true],
      "and",
      ["valideLig", "=", true]
    ]);
    const sharedTypePaletteDatasource = this.typesPaletteService
      .getDataSource_v2(["id", "description"]);
    sharedTypePaletteDatasource.filter(["valide", "=", true]);

    this.columnsSettings = {
      "proprietaireMarchandise.id": {
        dataSource: this.proprietairesDataSource,
        displayExpression: ["proprietaireMarchandise.code", "proprietaireMarchandise.raisonSocial"],
      },
      "fournisseur.id": {
        dataSource: this.fournisseursDataSource,
        displayExpression: ["fournisseur.code", "fournisseur.raisonSocial"],
      },
      "venteUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: ["venteUnite.id", "venteUnite.description"],
      },
      "codePromo.id": {
        dataSource: this.codesPromoService
          .getDataSource_v2(["id", "description"]),
        displayExpression: ["codePromo.id", "codePromo.description"],
      },
      "achatUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: ["achatUnite.id", "achatUnite.description"],
      },
      "typePalette.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: ["typePalette.id"],
      },
      "paletteInter.id": {
        dataSource: sharedTypePaletteDatasource,
        displayExpression: ["paletteInter.id"],
      },
      "fraisUnite.id": {
        dataSource: sharedBaseTarifDatasource,
        displayExpression: ["fraisUnite.id", "fraisUnite.description"],
      },
    };
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
  public columnsSettings: ColumnsSettings;

  @Input() ordreID: string;
  @ViewChild(DxDataGridComponent) grid: DxDataGridComponent;
  @Output() allowMutations = false;

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

  @Output() public ordreLigne: OrdreLigne;
  @Output() swapRowArticle = new EventEmitter();
  @Output() public articleLigneId: string;
  @Output() public fournisseurLigneId: string;
  @Output() public fournisseurCode: string;
  @ViewChild(ArticleCertificationPopupComponent) articleCertificationPopup: ArticleCertificationPopupComponent;
  @ViewChild(ArticleOriginePopupComponent) articleOriginePopup: ArticleOriginePopupComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ZoomFournisseurPopupComponent, { static: false }) zoomFournisseurPopup: ZoomFournisseurPopupComponent;
  @ViewChild(ArticleReservationOrdrePopupComponent, { static: false }) reservationStockPopup: ArticleReservationOrdrePopupComponent;

  onR;

  public displayCodeBefore(data: Partial<OrdreLigne>) {

    // @ts-ignore
    const column: dxDataGridColumn = this;

    return self.columnsSettings[column.dataField]
      .displayExpression
      .map(field => OrdreLigne.fetchValue(field.split("."), JSON.parse(JSON.stringify(data))))
      .join(" - ");
  }

  public gridConfigHandler = event =>
    this.gridConfigurator.init(this.gridID, {
      ...event,
      title: "Lignes de commande",
      onColumnsChange: this.onColumnsConfigurationChange.bind(this),
      toolbarItems: [{
        location: "after",
        widget: "dxButton",
        options: {
          icon: "sorted",
          hint: "Renuméroter les lignes",
          onClick: () => {
            this.reindexing();
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

    if (this.FEATURE.columnCertifications) this.initFeatures();
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

  focusedCellChanging(e) {
    // Keep the setTimeout function in place!!!
    // It seems that not everything's really ready when event is triggered
    // Conclusion => without a timeOut, major risk of unsaved data!
    setTimeout(() => {
      if (e.prevColumnIndex !== e.newColumnIndex && this.grid.instance.hasEditData())
        this.grid.instance.saveEditData();
    }, 10);
  }

  onSaving(event: OnSavingEvent) {

    if (event.component.hasEditData()) {

      event.cancel = true;
      return this.handleMutations();

    }
  }

  public onContentReady(event) {
    if (this.FEATURE.rowOrdering) this.handleNewArticles();
    this.gridRowsTotal = this.grid.instance.getVisibleRows()?.length;
    this.grid.instance.deselectAll();
  }

  // Reload grid data after external update
  public async update() {
    await (this.grid.dataSource as DataSource).reload();
    this.reindexing();
    this.grid.instance.saveEditData();
  }

  public calultateSortValue(event) {
    if (!event.numero) return Infinity;
    return parseFloat(event.numero);
  }

  private onColumnsConfigurationChange({ current }: { current: GridColumn[] }) {
    this.refreshData(current);
  }

  private handleMutations() {
    if (!this.changes.length) return;

    const source = this.grid.dataSource as DataSource;
    const store = source.store() as CustomStore;
    const change = this.changes.shift();

    if (change.type === "remove") {
      return store.remove(change.key)
        .then(() => {
          store.push([change]);
          this.gridsService.reload("SyntheseExpeditions", "DetailExpeditions");
          return this.handleMutations();
        });
    }

    if (change.type === "update")
      return new Promise(async (rsv, rjt) => {

        /* tslint:disable-next-line:prefer-const */
        let [name, value] = Object.entries(change.data)[0];

        // update "fournisseur" field when "proprietaire" value changed
        if (name === "proprietaireMarchandise") {
          const fournisseur = await this.updateFilterFournisseurDS(change.data.proprietaireMarchandise.id);
          this.grid.instance.cellValue(
            this.grid.instance.getRowIndexByKey(change.key),
            "fournisseur",
            fournisseur,
          );
          this.changes.push({
            key: change.key,
            type: "update",
            data: { fournisseur: { id: fournisseur?.id } } as Partial<OrdreLigne>,
          });
        }

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
              if (data.updateField)
                store.push([change, {
                  key: data.updateField.id,
                  type: "update",
                  data: data.updateField,
                }]);
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
      of(columns)
        .pipe(
          GridConfiguratorService.getVisible(),
          GridConfiguratorService.getFields(),
          map(fields => this.ordreLignesService.getListDataSource([
            OrdreLigne.getKeyField() as string,
            // grid config + visible
            ...fields,

            // display expressions
            ...Object
              .entries(this.columnsSettings)
              .map(([, column]) => column.displayExpression)
              .flat(),

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
          ])),
          tap(datasource => datasource.filter([
            ["ordre.id", "=", this.ordreID],
            "and",
            ["valide", "=", true],
            "and",
            ["article.id", "isnotnull", "null"],
          ])),
        )
        .subscribe(datasource => {
          this.grid.dataSource = datasource;
        });
  }

  private async updateRestrictions() {
    const isCloture = await this.ordresService.isCloture({ id: this.ordreID });
    this.allowMutations = !isCloture;
  }

  /**
   * Recalculate rows numero and push changes
   */
  private reindexing() {
    const datasource = this.grid.dataSource as DataSource;
    if (!datasource) return;
    notify(this.localizeService.localize("renumerotation-lignes-ordre"), "info", 3000);
    (datasource.items() as Partial<OrdreLigne>[])
      .sort((a, b) => parseInt(a.numero, 10) - parseInt(b.numero, 10))
      .forEach((item, index) => {
        const numero = (index + 1).toString().padStart(2, "0");
        if (item.numero !== numero)
          this.changes.push({
            key: item.id,
            type: "update",
            data: { numero },
          });
      });
  }

  // OLD codebase beyond this point (grid-lignes.component)

  private async updateFilterFournisseurDS(proprietaireID?: Fournisseur["id"]) {

    let fournisseur: Partial<Fournisseur>;
    const filters = [];

    const proprietaire = await this.fournisseursService
      .getOne_v2(proprietaireID, ["id", "code", "listeExpediteurs"])
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
          if (exp === proprietaire.code) {
            fournisseur = proprietaire;
            break;
          }
        }

        // Select first on the list if no selection
        const { id } = await this.fournisseursService
          .getFournisseurByCode(listExp[0], ["id"])
          .pipe(map(res => res.data.fournisseurByCode))
          .toPromise();
        fournisseur = fournisseur ?? { id };

        filters.pop();
      } else {
        fournisseur = proprietaire;
        if (proprietaire.id !== null)
          filters.push(["id", "=", proprietaire.id]);
      }
    }
    this.filterFournisseurDS(filters);
    return fournisseur;

  }

  filterFournisseurDS(filters?) {
    const myFilter: any[] = [["valide", "=", true]];
    if (filters?.length) myFilter.push("and", filters);
    this.fournisseursDataSource = this.fournisseursService.getDataSource_v2(["id", "code", "raisonSocial"]);
    this.fournisseursDataSource.filter(myFilter);
    if (this.columnsSettings)
      this.columnsSettings["fournisseur.id"].dataSource = this.fournisseursDataSource;
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

  onFocusedCellChanged(e) {

    if (e.column.dataField !== "fournisseur.id") return;

    const proprietaireMarchandise = e.row.data.proprietaireMarchandise;
    if (proprietaireMarchandise) this.updateFilterFournisseurDS(proprietaireMarchandise.id);

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
    // set moved row
    e.component.cellValue(e.fromIndex, "numero", OrdreLigne.formatNumero(e.toIndex + 1));

    // set offseted rows
    const offset = Math.sign(e.fromIndex - e.toIndex);
    const range = new Array(Math.abs(e.toIndex - e.fromIndex))
      .fill(null)
      .map((_, index) => [
        index + Math.min(e.fromIndex, e.toIndex) + (offset > 0 ? 0 : 1),
        index + Math.min(e.fromIndex, e.toIndex) + (offset > 0 ? 2 : 1),
      ]);
    range
      .forEach(([index, value]) => {
        e.component.cellValue(index, "numero", OrdreLigne.formatNumero(value));
      });

    e.component.saveEditData();
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

}
