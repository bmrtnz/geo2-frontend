import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { ArticlesService } from 'app/shared/services/api/articles.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit, NestedMain {

  articles: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: DataSource;
  origines: DataSource;
  varietes: DataSource;
  emballages: DataSource;
  modesCulture: DataSource;
  trueFalse: string[];
  initialSpecy: any;
  allGridFilters: any;
  toRefresh: boolean;

  constructor(
    public articlesService: ArticlesService,
    private router: Router,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    public clientsService: ClientsService
    ) {
      this.apiService = this.articlesService;
      this.especes = this.articlesService
        .getFilterDatasource('matierePremiere.espece.id');
      this.origines = this.articlesService
        .getFilterDatasource('matierePremiere.origine.description');
      this.varietes = this.articlesService
        .getFilterDatasource('matierePremiere.variete.description');
      this.emballages = this.articlesService
        .getFilterDatasource('emballage.emballage.description');
      this.modesCulture = this.articlesService
        .getFilterDatasource('matierePremiere.modeCulture.description');
      this.trueFalse = ['Tous', 'Oui', 'Non'];
    }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Article);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.articles = this.articlesService.getDataSource_v2(await fields.toPromise());
    this.toRefresh = true;
  }

  onCellPrepared(e) {
    // Adding code (prefix) before "variété" and "emballage"
    if (e.rowType === 'data') {
      if (e.column.dataField === 'matierePremiere.variete.description') {
        e.cellElement.innerText =  e.data.matierePremiere?.variete.id + ' ' + e.cellElement.innerText;
      } else if (e.column.dataField === 'emballage.emballage.description') {
        e.cellElement.innerText =  e.data.emballage?.emballage.id + ' ' + e.cellElement.innerText;
      }
    }
  }

  refreshArticlesGrid() {
    if (this.dataGrid.dataSource === null) this.dataGrid.dataSource = this.articles;
    this.dataGrid.instance.filter(this.allGridFilters);
    this.toRefresh = false;
  }

  onRowDblClick(e) {
    this.router.navigate([`/pages/articles/${e.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  /**
   * Apply filters from tag boxs
   * @param event List of field values
   * @param dataField Field path
   */
   onFieldValueChange(event: string[], dataField: string) {

    this.toRefresh = true;

    // No value cases
    if (event !== null) {
      if (!event.length) {
        event = ['null'];
      }
    }

    // Changing values for Oui/Non select-box
    if (event.toString() === 'Oui') {event = ['true'];}
    if (event.toString() === 'Non') {event = ['false'];}
    if (event.toString() === 'Tous') {event = ['null'];}
    this.tagFilters[dataField] = event;

    this.allGridFilters = Object
      .entries(this.tagFilters)
      .filter(([, values]) => values.length)
      .map(([path, values]) => values
        .map(value => [path, value === 'null' ? 'isnotnull' : '=', value])
        .map(value => JSON.stringify(value))
        .join(`¤${JSON.stringify(['or'])}¤`)
        .split('¤')
        .map(v => JSON.parse(v))
      )
      .map(value => JSON.stringify(value))
      .join(`¤${JSON.stringify(['and'])}¤`)
      .split('¤')
      .map(v => JSON.parse(v));

    // Filtering variete, emballage & origine selectBox list depending on specy
    const filter = [];

    if (dataField === 'matierePremiere.espece.id') {
      // Clear all dependent fields

      if (event.length) {
        event.forEach(element => {
          filter.push(['matierePremiere.espece.id', '=', element]);
          filter.push('or');
        });
        filter.pop(); // Remove last 'or'

        this.varietes = this.articlesService.getFilterDatasource('matierePremiere.variete.description');
        if (event[0] !== 'null') this.varietes.filter(filter);
        this.emballages = this.articlesService.getFilterDatasource('emballage.emballage.description');
        if (event[0] !== 'null') this.emballages.filter(filter);
        this.origines = this.articlesService.getFilterDatasource('matierePremiere.origine.description');
        if (event[0] !== 'null') this.origines.filter(filter);
      }
    }

  }

  capitalize(data) {
    return data ? data.key.charAt(0).toUpperCase() + data.key.slice(1).toLowerCase() : null;
  }

}
