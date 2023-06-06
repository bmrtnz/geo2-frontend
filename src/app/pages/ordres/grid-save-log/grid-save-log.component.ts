import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { OrdresSaveLogsService } from "app/shared/services/api/ordres-save-logs.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import gridConfig from "assets/configurations/grids.json";
import { ToggledGrid } from "../form/form.component";
import { GridColumn } from "basic";
import { DateManagementService } from "app/shared/services/date-management.service";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-grid-save-log",
  templateUrl: "./grid-save-log.component.html",
  styleUrls: ["./grid-save-log.component.scss"],
})
export class GridSaveLogComponent implements ToggledGrid, AfterViewInit {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  constructor(
    private dateManagementService: DateManagementService,
    private ordresSaveLogsService: OrdresSaveLogsService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridsService: GridsService
  ) {
    this.detailedFields = gridConfig["ordre-save-log"].columns;
  }

  ngAfterViewInit() {
    this.gridsService.register("Log", this.dataGrid);
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.ordresSaveLogsService.getDataSource_v2(
        this.detailedFields.map((property) => property.dataField)
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onCellPrepared(e) {
    // Best expression for date/time
    if (e.rowType === "data" && e.column.dataField === "dateModification") {
      if (e.value)
        e.cellElement.innerText = this.dateManagementService.friendlyDate(
          e.value
        );
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : (this.dataSource = null);
  }
}
