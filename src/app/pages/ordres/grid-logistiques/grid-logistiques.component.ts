import { Component, Input, ViewChild } from '@angular/core';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { OrdresLogistiquesService } from 'app/shared/services/api/ordres-logistiques.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { ToggledGrid } from '../form/form.component';
import * as gridConfig from 'assets/configurations/grids.json';
import { DxDataGridComponent } from 'devextreme-angular';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-logistiques',
  templateUrl: './grid-logistiques.component.html',
  styleUrls: ['./grid-logistiques.component.scss']
})
export class GridLogistiquesComponent implements ToggledGrid {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    private ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.detailedFields = gridConfig['ordre-logistique'].columns;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.ordresLogistiquesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
      this.dataSource.filter([
        ['ordre.id', '=', this.ordre.id],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }

}
