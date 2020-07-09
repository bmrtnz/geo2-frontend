import {Component, OnInit} from '@angular/core';
import {ArticlesService} from '../../../shared/services/articles.service';
import {Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit {

  articles: DataSource;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public articlesService: ArticlesService,
    private router: Router
  ) {
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

}
