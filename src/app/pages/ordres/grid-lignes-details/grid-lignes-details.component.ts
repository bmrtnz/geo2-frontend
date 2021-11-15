import { Component, Input, OnChanges, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import Ordre from 'app/shared/models/ordre.model';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-grid-lignes-details',
  templateUrl: './grid-lignes-details.component.html',
  styleUrls: ['./grid-lignes-details.component.scss']
})
export class GridLignesDetailsComponent implements AfterViewInit {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = gridConfig['ordre-ligne'].columns;
    this.dataSource = ordreLignesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  // ngOnChanges() {
  //   this.enableFilters();
  // }

  ngAfterViewInit() {
    this.enableFilters();
  }

  enableFilters() {
    if (!this.datagrid) return;
    if (this?.ordre?.id) {
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }


}
