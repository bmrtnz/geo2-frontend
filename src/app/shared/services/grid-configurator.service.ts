import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import dxDataGrid from 'devextreme/ui/data_grid';
import { from } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { GridConfig } from '../models';
import { GridsConfigsService } from './api/grids-configs.service';
import { AuthService } from './auth.service';

let self: GridConfiguratorService;

export enum Grid {
  Client = 'client',
  Fournisseur = 'fournisseur',
  Transporteur = 'transporteur',
  LieuPassageAQuai = 'lieu-passage-a-quai',
  Entrepot = 'entrepot',
  Contact = 'contact',
  Article = 'article',
  Stock = 'stock',
  Ordre = 'ordre',
  OrdreLigne = 'ordre-ligne',
}

@Injectable({
  providedIn: 'root'
})
export class GridConfiguratorService {

  private readonly GRID_CONFIG_FILE = '/assets/configurations/grids.json';
  private dataSource: DataSource;
  private currentGrid: Grid;

  constructor(
    private gridsConfigsService: GridsConfigsService,
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {
    self = this;
    this.dataSource = this.gridsConfigsService.getDataSource();
  }

  // Make enum available in templates
  get Grid() {
    return Grid;
  }

  /**
   * Set current grid name
   * @param gridName Grid name, act as identifier
   */
  as(gridName: Grid) {
    this.currentGrid = gridName;
    return self;
  }

  /**
   * Configure datasource filter with current grid and user
   * @throws Throw error if current grid is not defined
   */
  private filterGrid() {
    if (!this.currentGrid)
      throw Error('Grid name required, use GridConfiguratorService.with(gridName)');
    this.dataSource.filter([
      ['utilisateur.nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur],
      'and',
      ['grid', '=', this.currentGrid],
    ]);
  }

  /**
   * DX DataGrid CustomLoad callback, read and load configuration, load default configuration as fallback
   */
  async load() {
    self.filterGrid();
    const res: GridConfig[] = await self.dataSource.load();
    if (!res.length) return self.fetchDefaultConfig();
    // Clear search text and pagination
    delete res[0].config.searchText;
    delete res[0].config.focusedRowKey;
    return res[0].config;
  }

  /**
   * Build grid configuration object with current grid and user
   * @throws Throw error if current grid is not defined
   */
  private prepareGrid() {
    if (!this.currentGrid)
      throw Error('Grid name required, use GridConfiguratorService.with(gridName)');
    return {
      utilisateur: { nomUtilisateur: this.authService.currentUser.nomUtilisateur },
      grid: this.currentGrid,
    };
  }

  /**
   * DX DataGrid CustomSave callback, persist configuration
   * @param config GridConfig object
   */
  async save(config: {}) {
    const gridConfig = self.prepareGrid();
    from(self.gridsConfigsService.save({
      gridConfig: { ...gridConfig, config }
    }))
      .pipe(mergeAll())
      .subscribe();
  }

  /**
   * Fetch default grid configuration, merging common config with specified grid config
   * @param gridName Grid name
   */
  fetchDefaultConfig(grid = this.currentGrid) {
    if (!grid)
      throw Error('Grid name required, use GridConfiguratorService.with(gridName)');
    const keys = ['common', grid];
    return this.httpClient
      .get(this.GRID_CONFIG_FILE)
      .pipe(
        map(res => Object
          .entries(res)
          .filter(([key]) => keys.includes(key))
          .map(([, config]) => config)
          .reduce((previous, config) => ({ ...previous, ...config }))
        ),
      )
      .toPromise();
  }

  /**
   * Add reset button to binded datagrid
   * @param event Event object
   * @param cbk Callback to apply after restoring default state
   */
  onToolbarPreparing({component, toolbarOptions}: {component: dxDataGrid, toolbarOptions: any}, grid: Grid, cbk?: () => void) {
    toolbarOptions.items.unshift({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'material-icons settings_backup_restore',
        hint: 'Réinitialiser les colonnes affichées',
        onClick: async () => {
          component.clearFilter();
          const defaultState = await this.fetchDefaultConfig(grid);
          component.state(defaultState);
          if (cbk) cbk();
        }
      }
    });
  }

}
