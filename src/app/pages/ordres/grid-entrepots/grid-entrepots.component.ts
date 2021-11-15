import { Component, Input, OnChanges, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { AuthService, EntrepotsService } from 'app/shared/services';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-grid-entrepots',
  templateUrl: './grid-entrepots.component.html',
  styleUrls: ['./grid-entrepots.component.scss']
})
export class GridEntrepotsComponent implements AfterViewInit {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  @ViewChild(DxDataGridComponent) private entrepotGrid: DxDataGridComponent;

  constructor(
    public entrepotsService: EntrepotsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext,
  ) {
    this.detailedFields = gridConfig['ordre-entrepot'].columns;
    this.dataSource = entrepotsService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  ngAfterViewInit() {
    this.enableFilters();
    this.entrepotGrid.dataSource = this.dataSource;
  }

  enableFilters() {
    const filters = [
      ['client.societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      ['valide', '=', true],
      'and',
      ['client.valide', '=', true]
    ];

    this.dataSource.filter(filters);
   }

  reload() {
    this.dataSource.reload();
  }

}
