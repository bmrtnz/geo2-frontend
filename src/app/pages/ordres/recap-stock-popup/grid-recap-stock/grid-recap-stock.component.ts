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
      "mouvement.id",
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

      let DsItems = JSON.parse(JSON.stringify(res.data.allDetailStockResa));
      DsItems.sort((a, b) => a.stock?.age > b.stock?.age);
      DsItems.sort((a, b) => a.stock.fournisseur.code > b.stock.fournisseur.code);
      // DsItems.sort((a, b) => a.stock.fournisseur.code !== b.stock.fournisseur.code || a.stock?.age > b.stock?.age);
      // DsItems.sort((a, b) => (a.stock.fournisseur.code !== b.stock.fournisseur.code || a.stock?.age > b.stock?.age) || a.stock.quantiteInitiale > b.stock.quantiteInitiale);

      let oldFour, oldDate, oldDesc;
      let id = 1;
      DsItems.map((data) => {
        // Handle description abrégée
        if (data.stock.statutStock === "O") {
          let time = data.stock.dateInfo.split("T")[1].split(":");
          time.splice(-1);
          time = time.join(":");
          data.stock.userModification = `--> Option ${data.stock.utilisateurInfo} à ${time}`;
        } else {
          if (data.mouvement?.quantite >= 0) {
            data.stock.userModification = `Initial : ${data.stock.quantiteInitiale} - Déstocké : ${data.stock.quantiteReservee}`;
          } else {
            data.stock.userModification = `Réappro = ${Math.abs(data.stock.totalMouvements)}`;
          }
        }
        // Clear repeated fields, a kind of group structure wanted by BW
        if (oldFour === data.stock.fournisseur.code && oldDesc === data.stock.userModification && data.mouvement?.quantite) {
          data.stock.fournisseur.code = "";
          data.stock.quantiteDisponible = null;
          data.stock.age = null;
          data.stock.userModification = "";
        } else {
          oldFour = data.stock.fournisseur.code;
          oldDate = data.stock.dateFabrication;
          oldDesc = data.stock.userModification;
        }
        data.id = id;
        id++
      });

      this.datagrid.dataSource = DsItems;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
    });

  }

  public calculateCustomSummary(options) {
    if (options.name === "quantiteDisponible") {
      if (options.summaryProcess === "start") options.totalValue = 0;
      if (options.summaryProcess === "calculate") {

        options.totalValue += options.value.stock?.quantiteDisponible ?? 0;
      }
    }
  }

}
