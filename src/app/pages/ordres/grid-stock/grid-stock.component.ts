
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
    this.origines = this.originesService.getDistinctDataSource(["id", "description", "espece.id"]);
    this.varietes = this.varietesService.getDistinctDataSource(["id", "description"]);
    this.emballages = this.emballagesService.getDistinctDataSource(["id", "description", "espece.id"]);
    // this.modesCulture = this.articlesService.getFilterDatasource("matierePremiere.modeCulture.description");
    this.modesCulture = this.modesCultureService.getDataSource();
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
    if (this.dataGrid.dataSource === null
      || (Array.isArray(this.dataGrid.dataSource)
        && !this.dataGrid.dataSource.length))
      this.stocksService.allStockArticleList(
        this.especeSB.value,
        this.varieteSB.value,
        this.modesCultureSB.value,
        this.origineSB.value,
        this.emballageSB.value,
        this.bureauAchatSB.value,
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


  onRowDblClick({ data }: { data: { items: any } & Partial<StockArticle>, [key: string]: any }) {
    if (!data.articleID) {
      this.openFilePopup(data);
    } else {
      this.reservationPopup.present(data, this.ordre)
        .subscribe({
          error: ({ message }: Error) => notify(message, "error", 5000),
          complete: () => {
            notify(this.localizeService.localize("ajout-article") + "...", "info", 3000);
            setTimeout(() => {
              this.selectChange.emit();
              this.dataGrid.dataSource = [];
              this.toRefresh = true;
            });
          }
        });
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
      }
    }

    if (e.rowType === "data") {
      if (e.column.dataField === "articleDescription") {
        // Article bio
        if (e.data.bio) e.cellElement.classList.add("bio-article");
      }
    }

    if (["data", "group"].includes(e.rowType)) {
      // Fond jaune pour les stocks J21
      if (e.column.dataField === "quantiteCalculee4") e.cellElement.classList.add("highlight-stockJ21-cell");
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
