import { Component, Input, ViewChild } from '@angular/core';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { TracabiliteLignesService } from 'app/shared/services/api/tracabilite-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../form/form.component';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';

@Component({
  selector: 'app-grid-detail-palettes',
  templateUrl: './grid-detail-palettes.component.html',
  styleUrls: ['./grid-detail-palettes.component.scss']
})
export class GridDetailPalettesComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  constructor(
    private tracabiliteLignesService: TracabiliteLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = gridConfig['ordre-detail-palettes'].columns;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.tracabiliteLignesService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
      this.dataSource.filter([['tracabiliteDetailPalette.ordre.id', '=', this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
