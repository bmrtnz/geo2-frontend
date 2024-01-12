import {
  Component,
  EventEmitter,
  Input, OnInit,
  Output,
  ViewChild
} from "@angular/core";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Ordre from "app/shared/models/ordre.model";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";
import { AuthService } from "app/shared/services";

@Component({
  selector: "app-grid-litiges-lignes",
  templateUrl: "./grid-litiges-lignes.component.html",
  styleUrls: ["./grid-litiges-lignes.component.scss"],
})
export class GridLitigesLignesComponent implements OnInit {
  @Output() public litigeLigneSelected = new EventEmitter<LitigeLigne>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  datagrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columns: Observable<GridColumn[]>;
  public columnChooser = environment.columnChooser;
  private gridConfig: Promise<GridConfig>;

  constructor(
    private litigesLignesService: LitigesLignesService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService,
    public gridsService: GridsService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.LitigeLigne
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnInit() {
    this.gridsService.register("LitigeLigne", this.datagrid, this.gridsService.orderIdentifier(this.ordre));
    this.enableFilters();
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (["cause.description",
        "consequence.description",
        "responsableTypeCode",
        "ordreLigne.libelleDLV",
        "commentaireResponsable"]
        .includes(e.column.dataField))
        e.cellElement.title = e.value;
    }
  }

  onRowPrepared(e) {
    if (["data", "detail"].includes(e.rowType)) e.rowElement.classList.add("cursor-pointer");
  }

  async enableFilters() {
    if (this.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) => columns.map((column) => column.dataField))
      );
      this.dataSource = this.litigesLignesService.getDataSource_v2(
        await fields.toPromise()
      );
      this.dataSource.filter([
        ["ordreLigne.ordre.id", "=", this.ordre.id],
        "and",
        ["valide", "=", true],
      ]);
    }
  }

  reload() {
    return this.dataSource.reload();
  }

  public getFocusedRowKey() {
    const key = this.datagrid.instance?.totalCount()
      ? this.datagrid.focusedRowKey
      : null;
    if (key && this.datagrid.instance.getRowIndexByKey(key) >= 0) return key;
  }

  public getSelectedRowData(): Partial<LitigeLigne> {
    return this.datagrid.instance.getVisibleRows()[this.datagrid.focusedRowIndex]?.data;
  }

  public onRowClick(e) {
    if (e.rowType !== "detail") return;
    this.datagrid.instance.option("focusedRowKey", e.key)
  }

  public onRowDblClick(e) {
    if (!["data", "detail"].includes(e.rowType)) return;
    this.litigeLigneSelected.emit();
  }
}
