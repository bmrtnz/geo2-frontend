import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { AuthService, ClientsService, LocalizationService } from "app/shared/services";
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
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";


@Component({
  selector: "app-grid-reservation-stock-en-cours",
  templateUrl: "./grid-reservation-stock-en-cours.component.html",
  styleUrls: ["./grid-reservation-stock-en-cours.component.scss"]
})
export class GridReservationStockEnCoursComponent implements OnInit, OnChanges {

  @Input() public ordreLigneInfo: any;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGridResaEnCours: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public gridRowsTotal: number;
  columnChooser = environment.columnChooser;
  reservationsSource: Observable<DataSource>;
  public env = environment;

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
    public authService: AuthService,
    private stocksService: StocksService,
  ) {
    this.apiService = this.articlesService;

  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreReservationStockEnCours);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ordreLigneInfo)
      this.reservationsSource = this.stocksService
        .getLigneReservationDatasource(this.ordreLigneInfo.id);
  }

  onContentReady(e) {
    this.gridRowsTotal = this.dataGridResaEnCours.instance.getVisibleRows()?.length;
  }

  onCellPrepared(e) {
    // Higlight important columns
    if (e.column.dataField === "quantiteReservee") e.cellElement.classList.add("bold-text");
  }

  deleteReservations() {
    const result = confirm(this.localizeService.localize("text-popup-supprimer-reservations"), "Réservations");
    result.then((ok) => {
      if (ok) {
        // Suppression réservations en cours
      }
    });
  }

}
