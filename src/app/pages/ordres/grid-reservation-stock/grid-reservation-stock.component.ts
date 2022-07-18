import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AuthService, LocalizationService } from "app/shared/services";
import { StocksService } from "app/shared/services/api/stocks.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
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

  @Input() public ordreLigneInfo: any;
  @Input() public articleID: string;
  @Output() selectChange = new EventEmitter<any>();

  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true }) dataGridResa: DxDataGridComponent;
  @ViewChild(PromptPopupComponent, { static: false }) promptPopupComponent: PromptPopupComponent;

  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  reservationsSource: Observable<DataSource>;

  constructor(
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public authService: AuthService,
    private stocksService: StocksService,
  ) {
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreReservationStock);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
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
      e.column.dataField === "quantiteDisponible") {
      e.cellElement.classList.add("bold-text");
    }
  }

  onCellClick(e) {
    if (!e?.data) return;
    // TODO : Contrôle source non actuelle et retour le cas échéant
    let message = this.localizeService.localize("text-popup-changer-fournisseur");
    message = message
      .replace("&FPC", `${this.ordreLigneInfo.fournisseur.code} / ${this.ordreLigneInfo.proprietaireMarchandise.code}`)
      .replace("&FPN", `${e.data.fournisseurCode} / ${e.data.proprietaireCode}`);
    const result = confirm(message, "Choix fournisseur");
    result.then((ok) => {
      if (ok) {
        // Modification déstockage
      }
    });
  }

}
