import { Component, Input, ViewChild } from "@angular/core";
import { TabContext } from "../../../root/root.component";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxPopupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-visualiser-ordres-popup",
  templateUrl: "./visualiser-ordres-popup.component.html",
  styleUrls: ["./visualiser-ordres-popup.component.scss"]
})
export class VisualiserOrdresPopupComponent {

  @Input() public lignesOrdreIds: string[];
  @Input() public ordresIds: string[];

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
    public tabContext: TabContext,
    public ordreLignesService: OrdreLignesService
  ) {
    this.gridTitle = "";
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.LignesEdi,
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {

    if (!this.datagrid) return;
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
    const filter = [];

    // Filtering trought lines ids or order ids apromptccording to the case
    if (this.lignesOrdreIds?.length) {
      this.lignesOrdreIds.map(id => {
        filter.push(["id", "=", id], "or");
      });
      filter.pop();
      this.dataSource.filter(filter);
    } else if (this.ordresIds?.length) {
      this.ordresIds.map(id => {
        filter.push(["ordre.id", "=", id], "or");
      });
      filter.pop();
      this.dataSource.filter(filter);
    } else {
      this.dataSource = null;
    }

    this.datagrid.dataSource = this.dataSource;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("visualiser-ordres-popup");
    this.enableFilters();
  }

  updateChosenOrders() {
    const list = this.getGridSelectedArticles().map(row => `${row.ordre.campagne.id}-${row.ordre.numero}`);
    this.chosenOrders = new Set(list);
    if (this.chosenOrders.size) this.chosenOrdersDisplayed = Array.from(this.chosenOrders).join(" & ");
  }

  getGridSelectedArticles() {
    return this.datagrid.instance.getSelectedRowsData();
  }

  selectFromGrid() {
    this.updateChosenOrders();
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
    [...this.chosenOrders].map(ordre => {
      setTimeout(() => this.tabContext.openOrdre(ordre.split("-")[1], ordre.split("-")[0]));
    });
    this.visible = false;
  }

  cancelClick() {
    this.visible = false;
  }

  onHiding() {
    this.datagrid.instance.clearSelection();
    this.dataSource = null;
  }

}


