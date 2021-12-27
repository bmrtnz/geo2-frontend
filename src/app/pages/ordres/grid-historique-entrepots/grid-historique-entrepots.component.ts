import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'app/shared/services';
import { MruEntrepotsService } from 'app/shared/services/api/mru-entrepots.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { LocalizationService } from 'app/shared/services/localization.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { TabContext } from '../root/root.component';

@Component({
  selector: 'app-grid-historique-entrepots',
  templateUrl: './grid-historique-entrepots.component.html',
  styleUrls: ['./grid-historique-entrepots.component.scss']
})
export class GridHistoriqueEntrepotsComponent implements OnInit {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  @ViewChild(DxDataGridComponent) private entrepotGrid: DxDataGridComponent;
  @Input() public filter: [];

  constructor(
    public mruEntrepotsService: MruEntrepotsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public tabContext: TabContext,
  ) {}

    async ngOnInit() {
      this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreHistoriqueEntrepot);
      this.columns = from(this.gridConfig).pipe(GridConfiguratorService.getColumns());
      const visibleFields = from(this.gridConfig)
      .pipe(
        GridConfiguratorService.getColumns(),
        GridConfiguratorService.getVisible(),
        GridConfiguratorService.getFields(),
      );
      this.dataSource = this.mruEntrepotsService
      .getDataSource_v2(await visibleFields.toPromise());
      this.entrepotGrid.dataSource = this.dataSource;
      this.enableFilters();
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
