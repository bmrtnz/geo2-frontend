import { Component, EventEmitter, Input, ViewChild } from "@angular/core";
import { Article } from "app/shared/models";
import { GridsService } from "../.././grids.service";
import { AuthService, LocalizationService } from "app/shared/services";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { StocksService } from "app/shared/services/api/stocks.service";

export type Reservation = [number, number, string];

let self;
@Component({
  selector: 'app-grid-recap-stock',
  templateUrl: './grid-recap-stock.component.html',
  styleUrls: ['./grid-recap-stock.component.scss']
})
export class GridRecapStockComponent {
  @Input() public article: Partial<Article>;

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true }) datagrid: DxDataGridComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public columnChooser = environment.columnChooser;
  public recapSource: DataSource;
  public requiredFields: string[];

  constructor(
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    public stocksService: StocksService,
    public gridUtilsService: GridUtilsService,
    public gridsService: GridsService
  ) {
    self = this;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreRecapitulatifStock
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.requiredFields = [
      "article.id",
      "id",
      "mouvement.quantite",
      "mouvement.type",
      "mouvement.parQui",
      "mouvement.nomUtilisateur",
      "mouvement.dateModification",
      "mouvement.description",
      "stock.id",
      "stock.fournisseur.code",
      "stock.proprietaire.code",
      "stock.typePalette.id",
      "stock.quantiteInitiale",
      "stock.quantiteReservee",
      "stock.quantiteDisponible",
      "stock.totalMouvements",
      "stock.quantiteTotale",
      "stock.statutStock",
      "stock.dateInfo",
      "stock.utilisateurInfo",
      "stock.age",
      "stock.dateFabrication",
      "stock.dateStatut"
    ]
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {

      // Colorize date fab
      if (e.column.dataField === "stock.dateFabrication") {
        if (e.data.stock.age > 2 && e.data.stock.quantiteDisponible !== 0)
          e.cellElement.classList.add(e.data.stock.quantiteDisponible < 0 ? "red-font" : "green-font");
      }

      // Show description abrégée
      if (e.column.dataField === "stock.quantiteInitiale") {
        e.cellElement.textContent = ""; // Clear original content
        if (e.data.stock.statutStock === "O") {
          let time = e.data.stock.dateInfo.split("T")[1].split(":");
          time.splice(-1);
          time = time.join(":");
          e.cellElement.textContent = `--> Option ${e.data.stock.utilisateurInfo} à ${time}`;
        } else {
          if (e.data.mouvement.quantite >= 0) {
            e.cellElement.textContent = `Initial : ${e.data.stock.quantiteInitiale} - Déstocké : ${e.data.stock.quantiteReservee}`;
          } else {
            e.cellElement.textContent = `Réappro = ${Math.abs(e.data.stock.totalMouvements)}`;
          }
        }
      }
    }
  }

  async enableFilters(articleID: string) {
    const fields = await this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    ).toPromise();

    this.datagrid.instance.beginCustomLoading("");
    this.stocksService.allDetailStockResa(
      articleID,
      "%",
      this.requiredFields
    ).subscribe((res) => {
      this.datagrid.dataSource = res.data.allDetailStockResa;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
    });

  }
}