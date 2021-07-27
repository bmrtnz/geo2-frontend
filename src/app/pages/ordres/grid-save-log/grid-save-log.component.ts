import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresSaveLogsService } from 'app/shared/services/api/ordres-save-logs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-save-log',
  templateUrl: './grid-save-log.component.html',
  styleUrls: ['./grid-save-log.component.scss'],
})
export class GridSaveLogComponent implements OnChanges {
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
    this.dataSource = this.ordresSaveLogsService.getDataSource();
    this.detailedFields = this.ordresSaveLogsService.model
    .getDetailedFields(1, /^(?:utilisateur|dateModification)$/i, {forceFilter: true});
  }

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
      // console.log('ngOnChanges')
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
      this.dataSource.reload()
      // .then(
      //   res => {
      //     if (res.length) {console.log(res)}
      //   }
      // )
    }
  }

  onContentReady() {
  }
}
