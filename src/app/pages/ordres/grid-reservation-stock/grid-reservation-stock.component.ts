import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
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
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { confirm } from "devextreme/ui/dialog";
import { PromptPopupComponent } from "../../../shared/components/prompt-popup/prompt-popup.component";


@Component({
  selector: "app-grid-reservation-stock",
  templateUrl: "./grid-reservation-stock.component.html",
  styleUrls: ["./grid-reservation-stock.component.scss"]
})
export class GridReservationStockComponent implements OnInit, OnChanges {

  @Output() selectChange = new EventEmitter<any>();
  @Input() public ordreLigneInfo: any;
  @Output() public articleLigneId: string;

  @Input() public articleID: string;

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGridResa: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  reservationsSource: Observable<DataSource>;

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
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreReservationStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.articleID)
      this.reservationsSource = this.stocksService
        .getStockReservationDatasource(changes.articleID.currentValue);
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Fond jaune pour les stocks J9-21 si stock et police vert/rouge selon stock
      if (["quantiteCalculee3", "quantiteCalculee4"].includes(e.column.dataField)) {
        if (e.value) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
          if (e.value < 0) e.cellElement.classList.add("highlight-negativeStock-cell");
          if (e.value > 0) e.cellElement.classList.add("highlight-positiveStock-cell");
        }
      }
      // Fond jaune pour le fournisseur avec stocks J9-21
      if (e.column.dataField === "fournisseurCode") {
        if (e.data.quantiteCalculee3 || e.data.quantiteCalculee4) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
        }
      }
    }
    // Higlight important columns
    if (e.column.dataField.indexOf("quantiteCalculee") === 0 ||
      e.column.dataField === "totalDispo") {
      e.cellElement.classList.add("bold-text");
    }
  }

  onCellClick(e) {
    if (!e?.data) return;
    const message = this.localizeService.localize("text-popup-changer-fournisseur");
    message
      .replace("&FPC", `${this.ordreLigneInfo.fournisseur.code} / ${this.ordreLigneInfo.proprietaireMarchandise.code}`)
      .replace("&FPC", `${e.data.fournisseurCode} / ${e.data.proprietaireCode}`);
    const result = confirm(message, "Choix fournisseur");
    result.then((ok) => {
      if (ok) {
        // Modification réservation
      }
    });
  }

}
