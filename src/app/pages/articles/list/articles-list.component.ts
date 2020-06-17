import {Component, OnInit} from '@angular/core';
import {ArticlesService} from '../../../shared/services/articles.service';
import {Article} from '../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit {

  articles: DataSource;

  constructor(
    public articlesService: ArticlesService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.articles = this.articlesService.getDataSource();
  }

  onRowDblClick(e) {
    this.router.navigate([`/articles/${e.data.id}`]);
  }

}
