import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import { Observable } from 'rxjs';
import Ordre from 'app/shared/models/ordre.model';
import * as gridConfig from 'assets/configurations/grids.json';
import { map } from 'rxjs/operators';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-lignes',
  templateUrl: './grid-lignes.component.html',
  styleUrls: ['./grid-lignes.component.scss']
})
export class GridLignesComponent implements OnChanges {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = gridConfig['ordre-ligne'].columns;
    this.dataSource = ordreLignesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }

}
