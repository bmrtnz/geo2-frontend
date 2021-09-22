import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {ArticlesService} from '../../../shared/services/api/articles.service';
import {Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';
import { NestedMain } from 'app/pages/nested/nested.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { map } from 'rxjs/operators';
import { LocalizationService } from 'app/shared/services';
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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;

  constructor(
    public articlesService: ArticlesService,
    private router: Router,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
    ) {
    this.apiService = this.articlesService;
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

}
