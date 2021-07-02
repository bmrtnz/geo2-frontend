import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import OrdreSaveLog from 'app/shared/models/ordre-save-log.model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdreLignesTotauxDetailService } from 'app/shared/services/api/ordres-lignes-totaux-detail.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-lignes-totaux-detail',
  templateUrl: './grid-lignes-totaux-detail.component.html',
  styleUrls: ['./grid-lignes-totaux-detail.component.scss']
})
export class GridLignesTotauxDetailComponent implements OnChanges {
  @Output() public ordreSelected = new EventEmitter<OrdreSaveLog>();
  @Input() public filter: [];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private ordreLignesTotauxDetailService: OrdreLignesTotauxDetailService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.detailedFields = this.ordreLignesTotauxDetailService.model.getDetailedFields(1);
  }

  ngOnChanges() {
    if (this.ordre) {
      this.dataSource = this.ordreLignesTotauxDetailService
      .getTotauxDetailDataSource(this.ordre.id);
    }
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
      this.dataSource.reload();
    }
  }
}
