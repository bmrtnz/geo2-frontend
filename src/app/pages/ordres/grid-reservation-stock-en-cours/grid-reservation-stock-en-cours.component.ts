import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import {
  AuthService,
  ClientsService,
  LocalizationService,
} from "app/shared/services";
import { ApiService } from "app/shared/services/api.service";
import { ArticlesService } from "app/shared/services/api/articles.service";
import { BureauxAchatService } from "app/shared/services/api/bureaux-achat.service";
import { EmballagesService } from "app/shared/services/api/emballages.service";
import { EspecesService } from "app/shared/services/api/especes.service";
import { OriginesService } from "app/shared/services/api/origines.service";
import { StockMouvementsService } from "app/shared/services/api/stock-mouvements.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { VarietesService } from "app/shared/services/api/varietes.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridRowStyleService } from "app/shared/services/grid-row-style.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { concatMapTo, filter, map } from "rxjs/operators";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";

@Component({
  selector: "app-grid-reservation-stock-en-cours",
  templateUrl: "./grid-reservation-stock-en-cours.component.html",
  styleUrls: ["./grid-reservation-stock-en-cours.component.scss"],
})
export class GridReservationStockEnCoursComponent implements OnInit {
  @Input() public ordreLigneInfo: any;
  @Output() reservationChange = new EventEmitter<LigneReservation[]>();

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false })
  promptPopupComponent: PromptPopupComponent;

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
    private stockMouvementsService: StockMouvementsService
  ) {
    this.apiService = this.articlesService;
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreReservationStockEnCours
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.articles = this.articlesService.getDataSource_v2(
      await fields.toPromise()
    );
  }

  onContentReady(e) {
    this.gridRowsTotal = this.datagrid.instance.getVisibleRows()?.length;
    const items = (this.datagrid.dataSource as DataSource)?.items();
    this.reservationChange.emit(items ?? []);
  }

  deleteReservations() {
    from(
      confirm(
        this.localizeService.localize(
          "text-popup-supprimer-destockage" +
            (this.gridRowsTotal > 1 ? "s" : "")
        ),
        "Déstockage"
      )
    )
      .pipe(
        filter((pass) => pass),
        concatMapTo(
          this.stockMouvementsService.deleteAllByOrdreLigneId(
            this.ordreLigneInfo.id
          )
        )
      )
      .subscribe({
        error: ({ message }: Error) => notify(message, "error"),
        complete: () => this.reloadSource(this.ordreLigneInfo.id),
      });
  }

  reloadSource(ordreLigneID: string) {
    this.reservationsSource =
      this.stocksService.getLigneReservationDatasource(ordreLigneID);
  }

  clearDataSource() {
    this.datagrid.dataSource = null;
  }
}
