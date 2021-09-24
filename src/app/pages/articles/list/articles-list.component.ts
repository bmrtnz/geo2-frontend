import { Component, OnInit, EventEmitter, ViewChild, ViewChildren } from '@angular/core';
import { ArticlesService} from '../../../shared/services/api/articles.service';
import { Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';
import { NestedMain } from 'app/pages/nested/nested.component';
import { DxDataGridComponent, DxTagBoxComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { map } from 'rxjs/operators';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';

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
  @ViewChildren(DxTagBoxComponent) filterBoxes: any;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;
  tagFilters: { [path: string]: string[] } = {};
  especes: DataSource;
  origines: DataSource;
  varietes: DataSource;
  emballages: DataSource;
  modesCulture: DataSource;
  clients: DataSource;
  trueFalse: string[];

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
        .getFilterDatasource('matierePremiere.espece.description');
      this.origines = this.articlesService
        .getFilterDatasource('matierePremiere.origine.description');
      this.varietes = this.articlesService
        .getFilterDatasource('matierePremiere.variete.description');
      this.emballages = this.articlesService
        .getFilterDatasource('emballage.emballage.description');
      this.modesCulture = this.articlesService
        .getFilterDatasource('matierePremiere.modeCulture.description');
      this.clients = this.clientsService.getDataSource();
      this.trueFalse = ['Tous', 'Oui', 'Non'];
    }

  ngOnInit() {
    this.articles = this.articlesService.getDataSource();
    this.detailedFields = this.articlesService.model.getDetailedFields(3)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field =>
          !!(this.localizeService.localize('articles-' + field.path.replace('.description', '').replace('.', '-'))).length);
       }),
    );
  }

  onCellPrepared(e) {
    // Adding code (prefix) before "variété" and "emballage"
    if (e.rowType == 'data') {
      if (this.localizeService.localize("articles-matierePremiere-variete") == e.column.caption) {
        e.cellElement.innerText =  e.data.matierePremiere?.variete.id + ' ' + e.cellElement.innerText;
      } else if (this.localizeService.localize("articles-emballage-emballage") == e.column.caption) {
        e.cellElement.innerText =  e.data.emballage?.emballage.id + ' ' + e.cellElement.innerText;
      }
    }
  }

  onRowDblClick(e) {
    this.router.navigate([`/articles/${e.data.id}`]);
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

    // No value cases  
    if (event !== null) {
      if (!event.length) {
        event = ['null'];
      }
    }
    
    // Changing values for Oui/Non select-box
    if (event.toString() == 'Oui') {event = ['true'];}
    if (event.toString() == 'Non') {event = ['false'];}
    if (event.toString() == 'Tous') {event = ['null'];}
    this.tagFilters[dataField] = event;

    const filters = Object
      .entries(this.tagFilters)
      .filter(([, values]) => values.length)
      .map(([path, values]) => values
        .map(value => [path, value == 'null' ? 'isnotnull' : '=', value])
        .map(value => JSON.stringify(value))
        .join(`¤${JSON.stringify(['or'])}¤`)
        .split('¤')
        .map(v => JSON.parse(v))
      )
      .map(value => JSON.stringify(value))
      .join(`¤${JSON.stringify(['and'])}¤`)
      .split('¤')
      .map(v => JSON.parse(v));

      this.dataGrid.instance.filter(filters);
      // console.log(filters, this.dataGrid.instance.getCombinedFilter())

  }

  capitalize(data) {
    return data ? data.key.charAt(0).toUpperCase() + data.key.slice(1).toLowerCase() : null;
  }

}
