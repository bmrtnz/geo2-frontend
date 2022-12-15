
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import StockArticle from "app/shared/models/stock-article.model";
import { AuthService, ClientsService, LocalizationService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { ArticlesService } from "app/shared/services/api/articles.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { EmballagesService } from "app/shared/services/api/emballages.service";
import { EspecesService } from "app/shared/services/api/especes.service";
import { OriginesService } from "app/shared/services/api/origines.service";
import { StockArticlesAgeService } from "app/shared/services/api/stock-articles-age.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { VarietesService } from "app/shared/services/api/varietes.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";
import { ModesCultureService } from "../../../shared/services/api/modes-culture.service";
import { StockConsolideService } from "../../../shared/services/api/stock-consolide.service";
import { GridsService } from "../grids.service";
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ReservationPopupComponent } from "./reservation-popup/reservation-popup.component";

@Component({
  selector: "app-grid-stock",
  templateUrl: "./grid-stock.component.html",
  styleUrls: ["./grid-stock.component.scss"]
})
export class GridStockComponent implements OnInit {

  @Output() selectChange = new EventEmitter<any>();
  @Output() public articleLigneId: string;
  @Input() public ordre: Ordre;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) datagrid: DxDataGridComponent;
  @ViewChild("especeSB", { static: false }) especeSB: DxSelectBoxComponent;
  @ViewChild("varieteSB", { static: false }) varieteSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false }) modesCultureSB: DxSelectBoxComponent;
  @ViewChild("emballageSB", { static: false }) emballageSB: DxSelectBoxComponent;
  @ViewChild("origineSB", { static: false }) origineSB: DxSelectBoxComponent;
  @ViewChild("bureauAchatSB", { static: false }) bureauAchatSB: DxSelectBoxComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ReservationPopupComponent) reservationPopup: ReservationPopupComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: Observable<DataSource>;
  varietes: Observable<DataSource>;
  modesCulture: Observable<DataSource>;
  emballages: Observable<DataSource>;
  origines: Observable<DataSource>;
  bureauxAchat: Observable<DataSource>;
  trueFalse: any;
  initialSpecy: any;
  allGridFilters: any;
  toRefresh: boolean;
  gridTitle: string;
  noEspeceSet = true;

  constructor(
    public articlesService: ArticlesService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService,
    private stocksService: StocksService,
    private modesCultureService: ModesCultureService,
    public authService: AuthService,
    private stockConsolideService: StockConsolideService,
    private stockArticlesAgeService: StockArticlesAgeService,
    public gridsService: GridsService,
  ) {
    this.apiService = this.articlesService;
    this.especes = this.stocksService.getDistinctEntityDatasource("article.cahierDesCharge.espece.id");
    this.trueFalse = ["Tous", "Oui", "Non"];
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
    this.toRefresh = !this.noEspeceSet;
    this.gridTitle = this.localizeService.localize("articles-catalogue-preFilter-stock-title");
  }

  onFilterChange() {
    this.noEspeceSet = !this.especeSB.value;
    this.toRefresh = !this.noEspeceSet;
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event, dataField: string) {
    this.onFilterChange();

    // Filtering variete, emballage & origine selectBox list depending on specy
    const filter = [];

    if (dataField === "espece") {
      this.varieteSB.value = null;
      this.emballageSB.value = null;
      this.origineSB.value = null;

      if (event) {
        const especeFilter = `(article.cahierDesCharge.espece.id=='${event.key}')`;
        const dataToLoad = [
          { var: "varietes", id: "article.matierePremiere.variete.id", desc: "article.matierePremiere.variete.description" },
          { var: "emballages", id: "article.emballage.emballage.id", desc: "article.emballage.emballage.description" },
          { var: "origines", id: "article.matierePremiere.origine.id", desc: "article.matierePremiere.origine.description" },
          { var: "bureauxAchat", id: "fournisseur.bureauAchat.id", desc: "fournisseur.bureauAchat.raisonSocial" },
          { var: "modesCulture", id: "article.matierePremiere.modeCulture.id", desc: "article.matierePremiere.modeCulture.description" },
        ];

        dataToLoad.forEach(data => this[data.var] = this.stocksService.getDistinctEntityDatasource(data.id, data.desc, especeFilter));
      }
    }
  }

  displayCodeBefore(data) {
    if (data?.__typename === "DistinctEdge") {
      return data ? `${data.node.key} - ${data.node.description}` : null;
    }

    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  refreshArticlesGrid() {
    this.datagrid.instance.beginCustomLoading("");
    this.stocksService.allStockArticleList(
      this.especeSB.value?.key,
      this.varieteSB.value?.key,
      this.origineSB.value?.key,
      this.modesCultureSB.value?.key,
      this.emballageSB.value?.key,
      this.bureauAchatSB.value?.key
    ).subscribe((res) => {
      this.datagrid.dataSource = res.data.allStockArticleList;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
      this.toRefresh = false;
    });
  }

  openFilePopup(data) {
    this.articleLigneId = data.collapsedItems ? data.collapsedItems[0]?.articleID : data.items[0]?.articleID;
    if (this.articleLigneId) this.zoomArticlePopup.visible = true;
  }

  ajoutReservation() {
    this.selectChange.emit();
    this.datagrid.dataSource = [];
    this.toRefresh = true;
    this.gridsService.reload("SyntheseExpeditions");
  }

  onRowDblClick({ data }: { data: { items: any } & Partial<StockArticle>, [key: string]: any }) {
    if (data?.articleID) this.reservationPopup.present(data, this.ordre);
  }

  onCellClick(e) {
    if (e.rowType === "group" && e.column.dataField === "commentaire") {
      this.datagrid.instance.expandRow(e.key);
    }
  }

  onCellDblClick(e) {
    if (e.column.dataField === "articleDescription") {
      this.openFilePopup(e.data);
    }
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      if (e.column.dataField === "articleDescription" && e.cellElement.textContent) {
        e.cellElement.title = this.localizeService.localize("hint-dblClick-file");
        e.cellElement.classList.add("cursor-pointer");
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0].bio;
        if (data) e.cellElement.classList.add("bio-article");
      }
    }

    if (["data", "group"].includes(e.rowType)) {
      // Fond jaune pour les stocks J21
      if (e.column.dataField === "quantiteCalculee4") {
        e.cellElement.classList.add("highlight-stockJ21-cell");
      } else {
        // Comment report on group row
        if (e.column.dataField === "commentaire" && e.rowType === "group") {
          let data = e.data.items ?? e.data.collapsedItems;
          data = data[0].commentaire;
          e.cellElement.innerText = data;
        }
        if (e.column.dataField.indexOf("quantiteCalculee") === 0) {
          let neg = false;
          if (e.rowType === "data") {
            if (e.value) if (e.value < 0) neg = true;
          } else {
            if (e.summaryItems[0].value < 0) neg = true;
          }
          if (neg) e.cellElement.classList.add("highlight-negativeStock-cell");
        }
      }
    }

  }

  formatListItem(data) {
    if (data?.description)
      return `${data.id.toUpperCase()} - ${data.description?.toUpperCase()}`;
    if (data?.id)
      return data.id.toUpperCase();
    if (data?.key)
      return data.key.toUpperCase();
    return data.toString();
  }

  editComment(cell, event) {
    this.articleLigneId = cell.data.articleID;
    this.promptPopupComponent.show({ comment: cell.value });
  }

  validateComment(comment) {
    this.datagrid.instance.beginCustomLoading("");
    this.stockConsolideService.save({
      id: this.articleLigneId,
      commentaire: comment
    }).subscribe(() => this.refreshArticlesGrid());
  }

}
