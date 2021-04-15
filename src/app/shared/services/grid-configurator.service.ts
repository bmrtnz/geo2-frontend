import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DxoStateStoringComponent } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import dxDataGrid from 'devextreme/ui/data_grid';
import { map } from 'rxjs/operators';
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
  Historique = 'historique',
  OrdreLigne = 'ordre-ligne',
  OrdreLogistique = 'ordre-logistique',
  LitigeLigne = 'litige-ligne',
  OrdreBonAFacturer = 'ordre-bon-a-facturer',
  OrdreSupervisionLivraison= 'ordre-supervision-livraison'
}

@Injectable({
  providedIn: 'root'
})
export class GridConfiguratorService {

  private readonly GRID_CONFIG_FILE = '/assets/configurations/grids.json';
  private dataSource: DataSource;

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
   * Configure datasource filter with current grid and user
   */
  private filterGrid(grid: Grid) {
    this.dataSource.filter([
      ['utilisateur.nomUtilisateur', '=', this.authService.currentUser.nomUtilisateur],
      'and',
      ['grid', '=', grid],
    ]);
  }

  /**
   * DX DataGrid CustomLoad callback, read and load configuration, load default configuration as fallback
   */
  async load() {
    const context = this as unknown as DxoStateStoringComponent;
    self.filterGrid(context.storageKey as Grid);
    const res: GridConfig[] = await self.dataSource.load();
    if (!res.length) return self.fetchDefaultConfig(context.storageKey as Grid);
    // Clear search text and pagination
    const config = {...res[0].config}; // clone config (original is sealed)
    delete config.searchText;
    delete config.focusedRowKey;
    delete config.selectedRowKeys;
    return config;
  }

  /**
   * Build grid configuration object with current grid and user
   */
  private prepareGrid(grid: Grid) {
    return {
      utilisateur: { nomUtilisateur: this.authService.currentUser.nomUtilisateur },
      grid,
    };
  }

  /**
   * DX DataGrid CustomSave callback, persist configuration
   * @param config GridConfig object
   */
  async save(config: {}) {
    const context = this as unknown as DxoStateStoringComponent;
    const gridConfig = self.prepareGrid(context.storageKey as Grid);
    self.gridsConfigsService.save({
      gridConfig: { ...gridConfig, config }
    }).subscribe();
  }

  /**
   * Fetch default grid configuration, merging common config with specified grid config
   * @param gridName Grid name
   */
  fetchDefaultConfig(grid: Grid) {
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
