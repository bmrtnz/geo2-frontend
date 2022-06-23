
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ClientsService, LocalizationService } from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { ArticlesService } from "app/shared/services/api/articles.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { EmballagesService } from "app/shared/services/api/emballages.service";
import { EspecesService } from "app/shared/services/api/especes.service";
import { OriginesService } from "app/shared/services/api/origines.service";
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
import { ZoomArticlePopupComponent } from "../zoom-article-popup/zoom-article-popup.component";
import { ModesCultureService } from "../../../shared/services/api/modes-culture.service";
import StockArticle from "app/shared/models/stock-article.model";
import { ReservationPopupComponent } from "./reservation-popup/reservation-popup.component";
import Ordre from "app/shared/models/ordre.model";
import notify from "devextreme/ui/notify";

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
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  @ViewChild("especeSB", { static: false }) especeSB: DxSelectBoxComponent;
  @ViewChild("varieteSB", { static: false }) varieteSB: DxSelectBoxComponent;
  @ViewChild("modesCultureSB", { static: false }) modesCultureSB: DxSelectBoxComponent;
  @ViewChild("emballageSB", { static: false }) emballageSB: DxSelectBoxComponent;
  @ViewChild("origineSB", { static: false }) origineSB: DxSelectBoxComponent;
  @ViewChild("bureauAchatSB", { static: false }) bureauAchatSB: DxSelectBoxComponent;
  @ViewChild(ZoomArticlePopupComponent, { static: false }) zoomArticlePopup: ZoomArticlePopupComponent;
  @ViewChild(ReservationPopupComponent) reservationPopup: ReservationPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: DataSource;
  origines: DataSource;
  varietes: DataSource;
  emballages: DataSource;
  modesCulture: DataSource;
  bureauxAchat: DataSource;
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
    public especesService: EspecesService,
    public varietesService: VarietesService,
    public emballagesService: EmballagesService,
    public originesService: OriginesService,
    public bureauxAchatService: BureauxAchatService,
    private stocksService: StocksService,
    private modesCultureService: ModesCultureService
  ) {
    this.apiService = this.articlesService;

    this.especes = this.especesService.getDistinctDataSource(["id"]);
    this.especes.filter(["valide", "=", true]);
    this.origines = this.originesService.getDistinctDataSource(["id", "description", "espece.id"]);
    this.origines.filter(["valide", "=", true]);
    this.varietes = this.varietesService.getDistinctDataSource(["id", "description"]);
    this.varietes.filter(["valide", "=", true]);
    this.emballages = this.emballagesService.getDistinctDataSource(["id", "description", "espece.id"]);
    this.emballages.filter(["valide", "=", true]);
    this.modesCulture = this.modesCultureService.getDataSource();
    this.modesCulture.filter(["valide", "=", true]);
    this.trueFalse = ["Tous", "Oui", "Non"];
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
    this.toRefresh = !this.noEspeceSet;
    this.gridTitle = this.localizeService.localize("articles-catalogue-preFilter-stock-title");
    this.bureauxAchat = this.bureauxAchatService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
  }

  onFilterChange() {
    this.noEspeceSet = !this.especeSB.value?.length;
    this.toRefresh = !this.noEspeceSet;
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
  onFieldValueChange(event: string[], dataField: string) {
    this.onFilterChange();

    // Filtering variete, emballage & origine selectBox list depending on specy
    const filter = [];

    if (dataField === "matierePremiere.espece.id") {
      this.varieteSB.value = null;
      this.emballageSB.value = null;
      this.origineSB.value = null;

      if (event) {
        filter.push(["espece.id", "=", event]);

        this.varietes = this.varietesService.getDistinctDataSource(["id", "description"]);
        this.varietes.filter(filter);
        this.emballages = this.emballagesService.getDistinctDataSource(["id", "description", "espece.id"]);
        this.emballages.filter(filter);
        this.origines = this.originesService.getDistinctDataSource(["id", "description", "espece.id"]);
        this.origines.filter(filter);
      }
    }
  }

  displayCodeBefore(data) {
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
    this.stocksService.allStockArticleList(
      this.especeSB.value,
      this.varieteSB.value,
      this.modesCultureSB.value,
      this.origineSB.value,
      this.emballageSB.value,
      this.bureauAchatSB.value?.id
    ).subscribe((res) => {
      this.dataGrid.dataSource = res.data.allStockArticleList;
      this.dataGrid.instance.refresh();
      this.toRefresh = false;
    });
  }

  openFilePopup(data) {
    this.articleLigneId = data.collapsedItems ? data.collapsedItems[0]?.articleID : data.items[0]?.articleID;
    if (this.articleLigneId) this.zoomArticlePopup.visible = true;
  }

  ajoutReservation() {
    this.selectChange.emit();
    this.dataGrid.dataSource = [];
    this.toRefresh = true;
  }

  onRowDblClick({ data }: { data: { items: any } & Partial<StockArticle>, [key: string]: any }) {
    if (!data.articleID) {
      this.openFilePopup(data);
    } else {
      this.reservationPopup.present(data, this.ordre);
    }
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      if (e.column.dataField === "articleDescription" && e.cellElement.textContent) {
        const items = e.data.items ?? e.data.collapsedItems;
        e.cellElement.textContent = items[0].articleID + " - " + e.cellElement.textContent;
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

}
