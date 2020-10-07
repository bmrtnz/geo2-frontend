import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {ArticlesService} from '../../../shared/services/articles.service';
import {Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';
import { NestedMain } from 'app/pages/nested/nested.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';

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
    private router: Router
  ) {
    this.apiService = this.articlesService;
  }

  ngOnInit() {
    this.articles = this.articlesService.getDataSource();
    this.detailedFields = this.articlesService.model.getDetailedFields(2);
  }

  onRowDblClick(e) {
    this.router.navigate([`/articles/${e.data.id}`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

  loadDataGridState() {
    const data = window.localStorage.getItem('articlesStorage');
    if (data !== null) {

      // Suppression filtres/recherche
      const state = JSON.parse(data);
      for (const myColumn of state.columns) {
        if (myColumn.dataField !== 'valide') {myColumn.filterValue = null;}
      }
      state.searchText = '';

      return state;
    } else {
      return null;
    }

  }

  async saveDataGridState(data) {
    window.localStorage.setItem('articlesStorage', JSON.stringify(data));
  }

}
