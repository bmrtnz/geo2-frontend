import { Component, Input, OnChanges, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import Ordre from 'app/shared/models/ordre.model';
import { MruEntrepotsService } from 'app/shared/services/api/mru-entrepots.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { DxDataGridComponent } from 'devextreme-angular';
import * as gridConfig from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';
import { SummaryType } from 'app/shared/services/api.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { TabContext } from '../root/root.component';
import { AuthService } from 'app/shared/services';

@Component({
  selector: 'app-grid-historique-entrepots',
  templateUrl: './grid-historique-entrepots.component.html',
  styleUrls: ['./grid-historique-entrepots.component.scss']
})
export class GridHistoriqueEntrepotsComponent implements AfterViewInit {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];

  @ViewChild(DxDataGridComponent) private entrepotGrid: DxDataGridComponent;
  @Input() public filter: [];

  constructor(
    public mruEntrepotsService: MruEntrepotsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext,
  ) {
    this.detailedFields = gridConfig['ordre-historique-entrepot'].columns;
    this.dataSource = mruEntrepotsService.getDataSource_v2(this.detailedFields.map(property => property.dataField));
  }

  ngAfterViewInit() {
    this.enableFilters();
    this.entrepotGrid.dataSource = this.dataSource;
  }

  enableFilters() {
    const filters = [
      ['societe.id', '=', this.currentCompanyService.getCompany().id],
      'and',
      ['entrepot.valide', '=', true],
      'and',
      ['entrepot.client.valide', '=', true]
    ];
    if (!this.authService.currentUser.adminClient) {
      filters.push('and', ['utilisateur.nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur]);
    }
    this.dataSource.filter(filters);
   }

  reload() {
    this.dataSource.reload();
  }

}
