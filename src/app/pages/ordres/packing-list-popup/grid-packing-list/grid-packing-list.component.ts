import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { AuthService, LocalizationService } from "app/shared/services";
import { DxDataGridComponent } from "devextreme-angular";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { map } from "rxjs/operators";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { DatePipe } from "@angular/common";
import { CurrentCompanyService } from "app/shared/services/current-company.service";


@Component({
  selector: "app-grid-packing-list",
  templateUrl: "./grid-packing-list.component.html",
  styleUrls: ["./grid-packing-list.component.scss"],
})
export class GridPackingListComponent {
  @Input() ordreId: string;
  @Input() entrepotId: string;
  @Output() selectedOrders = new EventEmitter<boolean>();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public title: string;

  constructor(
    private ordresService: OrdresService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    public authService: AuthService,
    private datePipe: DatePipe
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PackingList
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  onSelectionChanged(e) {
    this.selectedOrders.emit(e.selectedRowsData);
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.column.dataField === "numero") {
        // E.g. Order 22-985452
        e.cellElement.textContent = `${e.data.campagne.id}-${e.value}`;
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      e.rowElement.classList.add("cursor-pointer");
      // Highlight current order
      if (e.data?.id === this.ordreId)
        e.rowElement.classList.add("highlight-order");
    }
  }

  async enableFilters() {
    this.datagrid.instance.option("focusedRowIndex", -1);
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.dataSource = this.ordresService.getDataSource_v2(
      await fields.toPromise()
    );
    // Retrieves orders of less than 180 days
    // and all orders from the same entrepot
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 180);
    // this.dataSource.filter([
    //   ["dateDepartPrevue", ">=", this.datePipe.transform(minDate, "yyyy-MM-ddTHH:mm:ss")],
    //   "and",
    //   ["entrepot.id", "=", this.entrepotId],
    // ])
    this.dataSource.filter([
      [["id", "=", "1672202"], "or", ["id", "=", "1670066"]],
      "and",
      ["entrepot.id", "=", this.entrepotId]
    ])
    this.datagrid.dataSource = this.dataSource;
  }
}
