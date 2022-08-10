import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { GridColumn } from "basic";
import {
  DxoColumnChooserComponent,
  DxoStateStoringComponent
} from "devextreme-angular/ui/nested";
import dxDataGrid from "devextreme/ui/data_grid";
import { confirm } from "devextreme/ui/dialog";
import { dxToolbarItem, dxToolbarOptions } from "devextreme/ui/toolbar";
import { environment } from "environments/environment";
import { defer, from, interval, Observable } from "rxjs";
import {
  concatMap,
  concatMapTo,
  debounce,
  filter,
  map,
  mergeMap,
  pairwise,
  reduce,
  share,
  shareReplay,
  startWith,
  tap
} from "rxjs/operators";
import { GridsConfigsService } from "./api/grids-configs.service";
import { AuthService } from "./auth.service";
import { LocalizationService } from "./localization.service";

let self: GridConfiguratorService;

export type GridConfig = {
  columns?: GridColumn[];
  filterValue?: any;
  focusedRowKey?: any;
  selectedRowKeys?: any[];
  selectionFilter?: any[];
  filterPanel?: {
    filterEnabled?: boolean;
  };
  paging?: {
    pageSize?: number;
    pageIndex?: number;
  };
  searchPanel?: {
    text?: string;
  };
};

export type AutoConfig = {
  component: dxDataGrid;
  toolbarOptions: dxToolbarOptions;
  toolbarItems: dxToolbarItem[];
  title?: string;
  autoStateStoring: boolean;
  autoColumnChooser: boolean;
  onConfigReload?: (state: GridConfig) => void;
  onColumnsChange?: (selection: {
    fresh?: GridColumn[];
    current: GridColumn[];
    previous?: GridColumn[];
  }) => void;
};

export enum Grid {
  Client = "client",
  Fournisseur = "fournisseur",
  Transporteur = "transporteur",
  LieuPassageAQuai = "lieu-passage-a-quai",
  Entrepot = "entrepot",
  Contact = "contact",
  Article = "article",
  Stock = "stock",
  Ordre = "ordre",
  Historique = "historique",
  OrdreLigne = "ordre-ligne",
  OrdreLigneDetails = "ordre-ligne-detail",
  OrdreLigneHistorique = "ordre-ligne-historique",
  OrdreLogistique = "ordre-logistique",
  OrdreLigneLogistique = "ordre-ligne-logistique",
  OrdreSaveLog = "ordre-save-log",
  OrdreLignesTotauxDetail = "ordre-lignes-totaux-detail",
  OrdreDetailPalettes = "ordre-detail-palettes",
  OrdreMarge = "ordre-marge",
  OrdreFrais = "ordre-frais",
  OrdreHistoriqueEntrepot = "ordre-historique-entrepot",
  OrdreEntrepot = "ordre-entrepot",
  OrdreStock = "ordre-stock",
  OrdreReservationStock = "ordre-reservation-stock",
  OrdreReservationStockEnCours = "ordre-reservation-stock-en-cours",
  CommentaireOrdre = "commentaire-ordre",
  LitigeLigne = "litige-ligne",
  HistoriqueModifDetail = "histo-modif-detail",

  OrdreSupervisionLivraison = "ordre-supervision-livraison",
  OrdreBonAFacturer = "ordre-bon-a-facturer",
  OrdresAFacturer = "ordres-a-facturer",
  OrdresNonClotures = "ordres-non-clotures",
  OrdresNonConfirmes = "ordres-non-confirmes",
  CommandesTransit = "commandes-transit",
  LignesCommandes = "lignes-commandes",
  PlanningDepart = "planning-depart",
  PlanningDepartDetail = "planning-depart-detail",
  Envois = "envois",
  ChoixEnvois = "choix-envois",
  AnnuleRemplace = "annule-remplace",
  ControleQualite = "controle-qualite",
  DepassementEncoursPays = "depassement-encours-pays",
  DepassementEncoursClient = "depassement-encours-client",
  PlanningTransporteurs = "planning-transporteurs",
  PlanningTransporteursApproche = "planning-transporteurs-approche",
  PlanningFournisseurs = "planning-fournisseurs",
  MouvFournisseursComptesPalox = "mouv-fournisseurs-comptes-palox",
  MouvClientsComptesPalox = "mouv-clients-comptes-palox",
  RecapFournisseursComptesPalox = "recap-fournisseurs-comptes-palox",
  RecapClientsComptesPalox = "recap-clients-comptes-palox",
  CommandesEdi = "commandes-edi"
}

const extraConfigurations = [
  "showInColumnChooser",
  "calculateDisplayValue",
  "cellTemplate",
  "editCellTemplate",
  "headerCellTemplate",
  "cssClass",
  "editorOptions",
  "allowEditing",
  "allowSorting",
  "dataType",
  "width",
  "format",
  "calculateCellValue",
];

@Injectable({
  providedIn: "root",
})
export class GridConfiguratorService {
  private readonly GRID_CONFIG_FILE = "/assets/configurations/grids.json";
  private fetchConfigFile = this.httpClient
    .get(this.GRID_CONFIG_FILE)
    .pipe(
      concatMap((res: { [key: string]: GridConfig }) => from(Object.entries(res))),
      shareReplay(),
    );
  private columnChooser = environment.columnChooser;

  constructor(
    private gridsConfigsService: GridsConfigsService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private apollo: Apollo,
    private localizationService: LocalizationService,
  ) {
    self = this;
  }

  // Make enum available in templates
  get Grid() {
    return Grid;
  }

  /**
   * Grid configuration observable mapper to get columns from config
   */
  static getColumns() {
    return map((config: GridConfig) => config.columns);
  }

  /**
   * Grid configuration observable mapper to get visible columns from columns
   */
  static getVisible() {
    return map((columns: GridColumn[]) =>
      columns.filter((column) => column.visible),
    );
  }

  /**
   * Grid configuration observable mapper to get visible columns from columns
   */
  static getVisibleAndID() {
    return map((columns: GridColumn[]) =>
      columns.filter(
        (column) => column.visible || column.dataField === "id",
      ),
    );
  }

  /**
   * Grid configuration observable mapper to get fields name from columns
   */
  static getFields() {
    return map((columns: GridColumn[]) =>
      columns.map((column) => column.dataField),
    );
  }

  /**
   * DX DataGrid CustomLoad callback, read and load configuration, load default configuration as fallback
   */
  load() {
    const context = this as unknown as DxoStateStoringComponent;
    return self.fetchConfig(context.storageKey as Grid);
  }

  /**
   * Build grid configuration object with current grid and user
   */
  private prepareGrid(grid: Grid) {
    return {
      utilisateur: {
        nomUtilisateur: this.authService.currentUser.nomUtilisateur,
      },
      grid,
    };
  }

  /**
   * DX DataGrid CustomSave callback, persist configuration
   * @param config GridConfig object
   */
  save(config: GridConfig) {
    const context = this as unknown as DxoStateStoringComponent;
    const gridConfig = self.prepareGrid(context.storageKey as Grid);
    self.gridsConfigsService
      .save_v2(["grid", "utilisateur.nomUtilisateur", "config"], {
        gridConfig: {
          ...gridConfig,
          config: {
            ...config,
            columns: config.columns.filter(c => c.dataField),
          },
        },
      })
      .subscribe();
  }

  /**
   * Register columns config in Apollo cache before save response
   * @param grid Targeted grid ID
   * @param columns Grid state configuration
   */
  private precacheColumns(
    grid: Grid,
    alterationsCallback: (columns: GridColumn[]) => GridColumn[],
  ) {
    const alter = (columns: GridColumn[]) =>
      alterationsCallback(JSON.parse(JSON.stringify(columns))); // unsealed
    this.apollo.client.cache.modify({
      id: GridsConfigsService.getCacheID({
        grid,
        utilisateur: this.authService.currentUser,
      }),
      fields: {
        config: (current) => ({
          ...current,
          columns: alter(current.columns),
        }),
      },
    });
  }

  /**
   * Evict config in Apollo cache
   * @param grid Targeted grid ID
   */
  private evictCache(grid: Grid) {
    this.apollo.client.cache.evict({
      id: GridsConfigsService.getCacheID({
        grid,
        utilisateur: this.authService.currentUser,
      }),
    });
  }

  /**
   * Fetch default grid configuration, merging common config with specified grid config
   * @param gridName Grid name
   */
  fetchDefaultConfig(grid: Grid): Promise<GridConfig> {
    if (!grid)
      throw Error(
        "Grid name required, use GridConfiguratorService.with(gridName)",
      );
    this.evictCache(grid);
    return this.fetchConfigFile.pipe(
      filter(([k]) => ["common", grid].includes(k)),
      // set defaults
      map(([, config]) => ({
        ...config,
        columns: config?.columns ? config.columns.map(column => ({
          ...column,
          ...column?.showInColumnChooser
            ? { showInColumnChooser: column?.showInColumnChooser }
            : { showInColumnChooser: true },
          ...column?.visible
            ? { visible: column?.visible }
            : { visible: false },
        })) : [],
      } as GridConfig)),
      concatMap(config => this.mergeExtraConfiguration(config, config)),
      reduce((previous, config) => ({ ...previous, ...config })),
    ).toPromise();
  }

  /**
   * Fetch user grid configuration or default config as fallback
   * @param gridName Grid name
   */
  async fetchConfig(grid: Grid): Promise<GridConfig> {
    if (!grid)
      throw Error(
        "Grid name required, use GridConfiguratorService.with(gridName)",
      );

    const res = await this.gridsConfigsService
      .fetchUserGrid(this.authService.currentUser, grid)
      .toPromise();
    const defaultConfig = this.fetchDefaultConfig(grid);
    if (res.error || !res.data.gridConfig)
      return await defaultConfig;

    // clone config (original is sealed)
    const userConfig: GridConfig = JSON.parse(JSON.stringify(res.data.gridConfig.config));

    // merge extra configurations ( not handled by DX state storing )
    return this.mergeExtraConfiguration(userConfig, await defaultConfig);
  }

  /**
   * Merge extra configurations in DxGridConfig ( not handled by DX state storing )
   */
  private mergeExtraConfiguration(inputConfig: GridConfig, defaultConfig: GridConfig) {
    if (!inputConfig.columns) return Promise.resolve(inputConfig);
    return from(inputConfig.columns)
      .pipe(
        mergeMap(async column => [column, defaultConfig
          .columns.find(c => c.dataField === column.dataField)] as [GridColumn, GridColumn]),
        map(([userColumn, defaultColumn]) => ({
          ...userColumn,
          ...defaultColumn ? extraConfigurations
            .filter(param => defaultColumn[param] !== undefined)
            .map(param => ({ [param]: defaultColumn[param] }))
            .reduce((acm, crt) => ({ ...acm, ...crt })) : {},
        })),
        reduce<GridColumn, GridColumn[]>((acc, value) => [...acc, value]),
        map(columns => ({ ...inputConfig, columns }) as GridConfig),
      )
      .toPromise();
  }

  /**
   * Fetch grid columns configuration
   * @param gridName Grid name
   * @returns Shared observable of columns
   */
  fetchColumns(grid: Grid): Observable<GridColumn[]> {
    return from(this.fetchConfig(grid)).pipe(
      share(),
      GridConfiguratorService.getColumns(),
    );
  }

  /**
   * Configure grid (reset button, state, events)
   * @param grid Grid configuration
   * @param options Extends `dxDataGrid.onToolbarPreparing` event parameter
   */
  public init(
    grid: Grid,
    {
      component,
      autoStateStoring = true,
      autoColumnChooser = true,
      onColumnsChange,
    }: AutoConfig,
  ) {

    component.beginCustomLoading("Initializing...");

    if (autoStateStoring)
      this.autoConfigureStateStoring(
        component.option("stateStoring"),
        grid,
      );
    if (autoColumnChooser)
      this.autoConfigureColumnChooser(component.option("columnChooser"));

    this.configureToolbar(grid, arguments[1]);

    const columnsChangeEmitter = new EventEmitter();
    component.option().onOptionChanged = (event) =>
      columnsChangeEmitter.emit(event);
    columnsChangeEmitter
      .pipe(
        filter(({ name }) => name === "columns" && !!onColumnsChange),
        tap(
          ({
            fullName,
            value,
          }: Partial<{ fullName: string; value: any }>) => {
            component.beginCustomLoading("Initializing columns...");
            const res = fullName.match(
              /^columns\[(\d+)\]\.visible$/,
            );
            if (res?.[1])
              this.precacheColumns(
                grid,
                (columns) => (
                  (columns[res[1]].visible = value), columns
                ),
              );
          },
        ),
        debounce(({ fullName }) =>
          interval(fullName === "columns" ? 10 : 1000),
        ),
        concatMapTo(defer(() => this.fetchColumns(grid))),
        GridConfiguratorService.getVisible(),
        startWith([] as GridColumn[]),
        pairwise(),
        tap(() => component.endCustomLoading()),
        filter(
          ([previous, current]) =>
            previous.length !== current.length ||
            !current.every(
              (v, i) => previous?.[i].dataField === v.dataField,
            ),
        ),
      )
      .subscribe(([previous, current]) => {
        const fresh = current.filter((x) => !previous.includes(x));
        onColumnsChange({ fresh, current, previous });
        component.endCustomLoading();
      });

    this.fetchConfig(grid).then((config) => component.state(config));
    component.option("filterPanel", { visible: true });
    component.endCustomLoading();
  }

  public onToolbarPreparing(title, options, grid: Grid, cbk?: () => void) {
    this.init(grid, {
      ...options,
      title,
      onConfigReload: cbk,
    });
  }

  /**
   * Auto configure distant DX StateStoring
   * @param state DX StateStoring component
   * @param grid Targeted grid config id
   */
  private autoConfigureStateStoring(
    state: DxoStateStoringComponent,
    grid: Grid,
  ) {
    state.enabled = true;
    state.type = "custom";
    state.customLoad = this.load;
    state.customSave = this.save;
    state.storageKey = grid;
  }

  /**
   * Auto configure DX ColumnChooser
   * @param chooser DX ColumnChooser component
   * @param grid Targeted grid config id
   */
  private autoConfigureColumnChooser(chooser: DxoColumnChooserComponent) {
    chooser.enabled = true;
    chooser.mode = "select";
    chooser.title = this.localizationService.localize("columnChooser");
    chooser.allowSearch = true;
    chooser.width = this.columnChooser.width;
    chooser.height = this.columnChooser.height;
  }

  private configureToolbar(
    grid: Grid,
    {
      component,
      toolbarOptions,
      toolbarItems = [],
      title,
      onConfigReload,
      onColumnsChange,
    }: AutoConfig,
  ) {
    toolbarOptions.items.unshift(...toolbarItems);
    toolbarOptions.items.unshift(
      {
        location: "after",
        widget: "dxButton",
        options: {
          icon: "material-icons settings_backup_restore",
          hint: "Réinitialiser les colonnes affichées",
          onClick: async () => {
            const defaultState = await this.fetchDefaultConfig(
              grid,
            );
            confirm("Êtes-vous sûr de vouloir réinitialiser l'affichage ?", "Configuration grille")
              .then(res => {
                if (res) {
                  component.state(defaultState);
                  // manual state reloading
                  component
                    .option("stateStoring")
                    .customLoad.call(component.option("stateStoring"));
                  if (onConfigReload) onConfigReload(defaultState);
                  if (onColumnsChange)
                    onColumnsChange({ current: defaultState.columns });
                }
              });
          },
        },
      },
      {
        // Datagrid title
        location: "left",
        widget: "dxTextBox",
        cssClass: "grid-title",
        options: {
          width: title?.length ? 400 : 0,
          readOnly: true,
          text: title,
        },
      },
    );

    if (component.option("columnChooser").enabled)
      if (
        !toolbarOptions.items.find(
          (i) => i.name === "columnChooserButton",
        )
      )
        toolbarOptions.items.unshift({
          widget: "dxButton",
          options: {
            icon: "column-chooser",
            hint: "Sélection des colonnes affichées",
            onClick: () => component.showColumnChooser(),
          },
          showText: "inMenu",
          location: "after",
          name: "columnChooserButton",
        });

    toolbarOptions.items.push({
      widget: "dxButton",
      options: {
        icon: "xlsxfile",
        hint: "Exporter la page",
        onClick: () => {
          const loadOptions = component.getDataSource().loadOptions();
          component.getDataSource().loadOptions = () => ({
            ...loadOptions,
            exportTake: component.pageSize(),
            exportPage: component.pageIndex(),
          });
          // @ts-ignore
          component.exportToExcel();
        },
      },
      showText: "inMenu",
      location: "after",
      name: "exportPage",
    } as dxToolbarItem);
  }
}
