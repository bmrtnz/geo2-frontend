import { Component, Input, ViewChild } from "@angular/core";
import { MruOrdresService } from "app/shared/services/api/mru-ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";

@Component({
  selector: "app-grid-import-programmes",
  templateUrl: "./grid-import-programmes.component.html",
  styleUrls: ["./grid-import-programmes.component.scss"]
})
export class GridImportProgrammesComponent {

  @Input() programID: string;
  @Input() title: string;

  @ViewChild(DxDataGridComponent, { static: true }) datagrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public detailedFields: GridColumn[];

  constructor(
    public mruOrdresService: MruOrdresService,
    private dateManagementService: DateManagementService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public tabContext: TabContext,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.ImportProgramme);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
  }

  async enableFilters() {
    if (true) {
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return column.dataField;
      })));
    }
  }

  reload() {
    this.datagrid.dataSource = this.dataSource;
  }

  onCellPrepared(e) {

  }
}
