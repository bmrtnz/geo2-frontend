import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { TabContext } from "../../../root/root.component";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxPopupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../../../grids.service";

@Component({
  selector: "app-visualiser-ordres-popup",
  templateUrl: "./visualiser-ordres-popup.component.html",
  styleUrls: ["./visualiser-ordres-popup.component.scss"]
})
export class VisualiserOrdresPopupComponent implements OnChanges {

  @Input() public lignesOrdreIds: string[];

  public dataSource: DataSource;
  public visible: boolean;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public chosenOrders: any;
  public chosenOrdersDisplayed: string;
  public gridTitle: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext,
    public ordreLignesService: OrdreLignesService,
    public gridsService: GridsService,
  ) {
    this.gridTitle = ""; // this.localizeService.localize("ordre-edi-choix-ordre");
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.LignesEdi,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
  }

  ngOnChanges() {
  }

  async enableFilters() {

    if (!this.datagrid) return;
    const fields = this.columns.pipe(map(columns => columns.map(column => column.dataField)));
    this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());

    // if (this.lignesOrdreIds?.length) {
    //   const filter = [];
    //   this.lignesOrdreIds.map(id => {
    //     filter.push(["id", "=", id], "or");
    //   });
    //   filter.pop();
    //   this.dataSource.filter(filter);
    // }
    if (this.lignesOrdreIds?.length) {
      const filter = [];
      this.lignesOrdreIds.map(id => {
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


