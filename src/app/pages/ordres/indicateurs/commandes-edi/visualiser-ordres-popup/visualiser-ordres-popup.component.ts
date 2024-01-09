import { Component, Input, ViewChild } from "@angular/core";
import { TabContext } from "../../../root/root.component";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import {
  GridConfiguratorService,
  Grid,
  GridConfig,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import notify from "devextreme/ui/notify";
import { AuthService, LocalizationService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

@Component({
  selector: "app-visualiser-ordres-popup",
  templateUrl: "./visualiser-ordres-popup.component.html",
  styleUrls: ["./visualiser-ordres-popup.component.scss"],
})
export class VisualiserOrdresPopupComponent {
  @Input() public lignesOrdreIds: string[];
  @Input() public ordresNumeros: string[];

  public dataSource: DataSource;
  public visible: boolean;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public chosenOrders: any;
  public chosenOrdersDisplayed: string;
  public gridTitle: string;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private currentCompanyService: CurrentCompanyService,
    private localization: LocalizationService,
    public tabContext: TabContext,
    public authService: AuthService,
    public ordreLignesService: OrdreLignesService
  ) {
    this.gridTitle = "";
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.LignesEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {
    if (!this.datagrid) return;
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.dataSource = this.ordreLignesService.getDataSource_v2(
      await fields.toPromise()
    );
    const filter = [];

    // Filtering trought lines ids or order ids according to the case
    if (this.lignesOrdreIds?.length) {
      this.lignesOrdreIds.map((id) => {
        filter.push(["ediLigne.id", "=", id], "or");
      });
      filter.pop();
      this.dataSource.filter(filter);
    } else if (this.ordresNumeros?.length) {
      this.ordresNumeros.map((id) => {
        filter.push(["ordre.numero", "=", id], "or");
      });
      filter.pop();
      this.dataSource.filter([
        [
          "ordre.campagne.id",
          "=",
          this.currentCompanyService.getCompany().campagne.id,
        ],
        "and",
        [filter],
      ]);
    } else {
      this.dataSource = null;
    }

    this.datagrid.dataSource = this.dataSource;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("visualiser-ordres-popup");
    this.datagrid.dataSource = null;
    this.enableFilters();
  }

  updateChosenOrders() {
    const list = this.getGridSelectedArticles().map(
      (row) => `${row.ordre.campagne.id}-${row.ordre.numero}`
    );
    this.chosenOrders = new Set(list);
    if (this.chosenOrders.size)
      this.chosenOrdersDisplayed = Array.from(this.chosenOrders).join(" & ");
  }

  getGridSelectedArticles() {
    return this.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid() {
    this.updateChosenOrders();
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.column.dataField === "ordre.numero")
        e.cellElement.classList.add("bold-text");
    }
  }

  onRowClick(e) {
    // Allows to select an item by clicking on a row
    // in addition to the expected checkbox
    const keys = e.component.getSelectedRowKeys();
    const index = keys.indexOf(e.key);

    if (index > -1) {
      keys.splice(index, 1);
    } else {
      keys.push(e.key);
    }
    e.component.selectRows(keys);
  }

  applyClick() {
    const nbOrdres = this.chosenOrders.size;
    notify(
      this.localization
        .localize("ouverture-ordre" + (nbOrdres > 1 ? "s" : ""))
        .replace("&NO", this.chosenOrdersDisplayed),
      "success",
      1500
    );

    [...this.chosenOrders].map((ordre) => {
      setTimeout(() =>
        this.tabContext.openOrdre(
          ordre.split("-")[1],
          ordre.split("-")[0],
          false
        )
      );
    });
    this.visible = false;
  }

  cancelClick() {
    this.visible = false;
  }

  onHiding() {
    this.datagrid.instance.clearSelection();
  }
}
