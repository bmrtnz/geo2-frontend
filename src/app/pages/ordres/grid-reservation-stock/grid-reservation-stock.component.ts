import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
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


@Component({
  selector: "app-grid-reservation-stock",
  templateUrl: "./grid-reservation-stock.component.html",
  styleUrls: ["./grid-reservation-stock.component.scss"]
})
export class GridReservationStockComponent implements OnInit {

  @Output() selectChange = new EventEmitter<any>();
  @Output() public articleLigneId: string;
  @Input() public ordre: Ordre;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: Observable<DataSource>;
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
    private modesCultureService: ModesCultureService,
    public authService: AuthService,
    private stockConsolideService: StockConsolideService,
    private stockArticlesAgeService: StockArticlesAgeService,
  ) {
    this.apiService = this.articlesService;

  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreReservationStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
    this.gridTitle = this.localizeService.localize("articles-catalogue-preFilter-stock-title");
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Fond jaune pour les stocks J21
      if (e.column.dataField === "quantiteCalculee4") {
        e.cellElement.classList.add("highlight-stockJ21-cell");
      } else {
        if (e.column.dataField.indexOf("quantiteCalculee") === 0) {
          if (e.value) if (e.value < 0) e.cellElement.classList.add("highlight-negativeStock-cell");
        }
      }
    }

  }

}
