import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresSaveLogsService } from 'app/shared/services/api/ordres-save-logs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ToggledGrid } from '../form/form.component';

@Component({
  selector: 'app-grid-save-log',
  templateUrl: './grid-save-log.component.html',
  styleUrls: ['./grid-save-log.component.scss'],
})
export class GridSaveLogComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private ordresSaveLogsService: OrdresSaveLogsService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = this.ordresSaveLogsService.model
    .getDetailedFields(1, /^(?:utilisateur|dateModification)$/i, {forceFilter: true});
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.ordresSaveLogsService.getDataSource();
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
