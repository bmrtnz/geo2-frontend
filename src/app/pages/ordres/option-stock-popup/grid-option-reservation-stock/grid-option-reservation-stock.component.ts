import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Article } from "app/shared/models";
import { GridsService } from "../.././grids.service";
import StockReservation from "app/shared/models/stock-reservation.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { StocksService } from "app/shared/services/api/stocks.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxTextBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { alert, confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

export type Reservation = [number, number, string];

@Component({
  selector: "app-grid-option-reservation-stock",
  templateUrl: "./grid-option-reservation-stock.component.html",
  styleUrls: ["./grid-option-reservation-stock.component.scss"],
})
export class GridOptionReservationStockComponent implements OnInit {
  @Input() public article: Partial<Article>;
  @Input() public ligneStock: any;
  @Output() reservationChange = new EventEmitter<Reservation>();

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;
  @ViewChild("comBox", { static: false }) comBox: DxTextBoxComponent;
  @ViewChild("qteBox", { static: false }) qteBox: DxNumberBoxComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  reservationsSource: Observable<DataSource>;
  public summaryFields = [
    "quantiteDisponible",
    "quantiteInitiale",
    "quantiteReservee",
    "quantiteCalculee1",
    "quantiteCalculee2",
    "quantiteCalculee3",
    "quantiteCalculee4",
  ];
  public stockInfo: string;
  private separator = " ● ";
  public stockId: string;
  public propCode: string;
  public palCode: string;
  public dispo: number;

  constructor(
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    private stocksService: StocksService,
    public gridsService: GridsService
  ) {}

  ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreOptionReservationStock
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  initFields() {
    this.stockInfo = "";
    if (this.comBox)
      this.comBox.value = this.authService.currentUser.nomUtilisateur;
    if (this.qteBox) this.qteBox.value = null;
  }

  updateStockInfo(data?) {
    if (!data) return (this.stockInfo = "");

    // Update useful data for further reservation
    this.stockId = data.stock.id;
    this.palCode = data.typePaletteCode;
    this.propCode = data.proprietaireCode;
    this.dispo = data.quantiteDisponible;

    // Update info text
    this.stockInfo = `Stock n° ${this.stockId} ${this.separator}`;
    this.stockInfo += `Expéditeur : ${data.fournisseurCode}${this.separator}`;
    this.stockInfo += `Marchandise de : ${this.propCode}${this.separator}`;
    this.stockInfo += `Dispo : ${this.dispo}`;
  }

  onFocusedRowChanged(e) {
    if (e.row?.rowType === "data") {
      if (e.row?.data?.stock?.statutStock === "O") {
        // Case: already an option
        notify(
          this.localizeService.localize("warning-option-on-option"),
          "warning",
          1500
        );
      } else {
        this.updateStockInfo(e.row.data);
        this.qteBox.instance.focus();
        return;
      }
    }
    this.updateStockInfo(); // Clear all
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Fond jaune pour les stocks J9-21 si stock et police vert/rouge selon stock
      if (
        ["quantiteCalculee3", "quantiteCalculee4"].includes(e.column.dataField)
      ) {
        if (e.value) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
          if (e.value < 0)
            e.cellElement.classList.add("highlight-negativeStock-cell");
          if (e.value > 0)
            e.cellElement.classList.add("highlight-positiveStock-cell");
        }
      }
      // Fond jaune pour le fournisseur avec stocks J9-21
      if (e.column.dataField === "fournisseurCode") {
        if (e.data.quantiteCalculee3 || e.data.quantiteCalculee4) {
          e.cellElement.classList.add("highlight-stockJ9-21-cell");
        }
      }
      // Higlight important columns
      if (
        e.column.dataField?.indexOf("quantiteCalculee") === 0 ||
        e.column.dataField === "quantiteDisponible"
      ) {
        e.cellElement.classList.add("bold-text");
      }

      // Prefix "OPTION " if this is an option
      if (e.column.dataField === "option" && e.data.stock.statutStock === "O") {
        e.cellElement.classList.add("option-text");
        e.cellElement.textContent = `OPTION ${e.value ?? ""}`;
      }

      // Show situation
      if (e.column.dataField === "quantiteReservee1") {
        const first = e.data.option ? "Réservé :" : "Initial :";
        e.cellElement.textContent = `${first} ${e.data.quantiteInitiale} - Déstocké : ${e.data.quantiteReservee}`;
      }
    }

    // Focus on current fournisseur or the stock row when unique
    if (e.rowType === "group") {
      if (e.column.dataField === "Fournisseur" && this.ligneStock) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];
        if (
          data.proprietaireCode === this.ligneStock.proprietaireCode &&
          data.fournisseurCode === this.ligneStock.fournisseurCode
        ) {
          // Don't ask me why a timeout needed (otherwise focus event is not triggered as it should be)
          if (e.row?.data?.items?.length !== 1) {
            setTimeout(() =>
              this.datagrid.instance.option("focusedRowIndex", e.rowIndex)
            );
          } else {
            setTimeout(() => {
              this.datagrid.instance.option(
                "focusedRowIndex",
                this.datagrid.instance.getRowIndexByKey(e.row.data.items[0].id)
              );
            });
          }
        }
      }
    }
  }

  async onClickReservation() {
    const stockAfter = this.dispo - this.qteBox.value;
    if (stockAfter < 0) {
      if (
        await confirm(
          this.localizeService
            .localize("ordres-dispo-stock-negatif")
            .replace("&N", stockAfter.toString()),
          this.localizeService.localize("title-option-stock-popup")
        )
      ) {
        this.reservation();
      }
    } else {
      this.reservation();
    }
  }

  reservation() {
    if (!this.qteBox.value) {
      notify(
        this.localizeService.localize("warning-option-noQty"),
        "warning",
        1500
      );
      this.qteBox.instance.focus();
      return;
    }

    this.stocksService
      .takeOptionStock(
        this.qteBox.value,
        this.stockId,
        this.propCode,
        this.palCode,
        this.comBox.value
      )
      .subscribe({
        next: (res) => {
          notify(
            this.localizeService.localize("reservation-ok"),
            "success",
            3000
          );
          this.reservationChange.emit();
        },
        error: (error: Error) => {
          console.log(error);
          alert(
            this.messageFormat(error.message),
            this.localizeService.localize("title-option-stock-popup")
          );
        },
      });
  }

  private messageFormat(mess) {
    const functionNames = ["takeOptionStock"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

  reloadSource(articleID: string) {
    this.reservationsSource =
      this.stocksService.getStockReservationDatasource(articleID);
  }

  public calcFouProp(rowData: Partial<StockReservation>) {
    return `${rowData.fournisseurCode}/${rowData.proprietaireCode}`;
  }

  public calculateCustomSummary(options) {
    if (options.name === "typePaletteCode")
      if (options.summaryProcess === "calculate")
        options.totalValue = options.value;
  }
}
