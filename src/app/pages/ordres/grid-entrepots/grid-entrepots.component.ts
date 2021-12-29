import { Component, OnInit, ViewChild } from '@angular/core';
import { Entrepot } from 'app/shared/models';
import { AuthService, EntrepotsService } from 'app/shared/services';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { GridColumn, SingleSelection } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-grid-entrepots',
  templateUrl: './grid-entrepots.component.html',
  styleUrls: ['./grid-entrepots.component.scss']
})
export class GridEntrepotsComponent implements OnInit, SingleSelection<Entrepot> {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  @ViewChild(DxDataGridComponent, {static: false}) private entrepotGrid: DxDataGridComponent;

  constructor(
    public entrepotsService: EntrepotsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext,
  ) {}

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreEntrepot);
    this.columns = from(this.gridConfig).pipe(GridConfiguratorService.getColumns());
    const visibleFields = from(this.gridConfig)
    .pipe(
      GridConfiguratorService.getColumns(),
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
    );
    this.dataSource = this.entrepotsService
    .getDataSource_v2(await visibleFields.toPromise());
    this.entrepotGrid.dataSource = this.dataSource;
    this.enableFilters();
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

  getSelectedItem() {
    return this.entrepotGrid.instance.getVisibleRows()
    .filter( row => row.key === this.entrepotGrid.focusedRowKey)
    .map( row => row.data)[0];
  }

}
