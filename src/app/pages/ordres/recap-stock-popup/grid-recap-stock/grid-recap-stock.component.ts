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
        if (e.data.stock.ageCopy > 2 && e.data.stock.quantiteDisponibleCopy !== 0)
          e.cellElement.classList.add(e.data.stock.quantiteDisponibleCopy < 0 ? "red-font" : "green-font");
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

      // Build description abrégée
      DsItems.map((data) => {
        if (data.stock.statutStock === "O") {
          let time = data.stock.dateInfo.split("T")[1].split(":");
          time.splice(-1);
          data.stock.userModification = `--> Option ${data.stock.utilisateurInfo} à ${time.join(":")}`;
        } else if (data.mouvement?.quantite >= 0)
          data.stock.userModification = `Initial : ${data.stock.quantiteInitiale} - Déstocké : ${data.stock.quantiteReservee}`;
      });

      // Sort depending on these properties
      DsItems.sort((a, b) => {
        if (a.stock.fournisseur.code < b.stock.fournisseur.code) return -1;
        if (a.stock.fournisseur.code > b.stock.fournisseur.code) return 1;
        if (a.stock?.age < b.stock?.age) return -1;
        if (a.stock?.age > b.stock?.age) return 1;
        if (a.stock.typePalette.id < b.stock.typePalette.id) return -1;
        if (a.stock.typePalette.id > b.stock.typePalette.id) return 1;
        if (a.stock.mouvement?.quantite < b.stock.mouvement?.quantite) return -1;
        if (a.stock.mouvement?.quantite > b.stock.mouvement?.quantite) return 1;
        if (a.stock.userModification > b.stock.userModification) return -1;
        if (a.stock.userModification < b.stock.userModification) return 1;
        if (a.stock?.dateFabrication < b.stock?.dateFabrication) return -1;
        if (a.stock?.dateFabrication > b.stock?.dateFabrication) return 1;
        return 0;
      });

      // Handle removal of repeated fields, a kind of group structure wanted by BW
      let oldFour, oldDate, oldDesc, oldAge, oldQteD;
      let id = 1;
      DsItems.map((data) => {
        // Copy age & qté dispo as we can clear them
        data.stock.ageCopy = data.stock.age;
        data.stock.quantiteDisponibleCopy = data.stock.quantiteDisponible;

        if (oldFour === data.stock.fournisseur.code && oldDesc === data.stock.userModification && oldAge === data.stock.age) {
          data.stock.fournisseur.code = "";
          if (oldQteD === data.stock.quantiteDisponible) {
            data.stock.quantiteDisponible = null;
          } else oldQteD = data.stock.quantiteDisponible;
          data.stock.age = null;
          data.stock.userModification = "";
        } else {
          oldFour = data.stock.fournisseur.code;
          oldDate = data.stock.dateFabrication;
          oldDesc = data.stock.userModification;
          oldAge = data.stock.age;
          oldQteD = data.stock.quantiteDisponible;
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
