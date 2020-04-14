import {Component, OnInit} from '@angular/core';
import {ArticlesService} from '../../../shared/services/articles.service';
import {Article} from '../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss']
})
export class ArticlesListComponent implements OnInit {

  dataSource: any;
  articles: [Article];

  constructor(
    private articlesService: ArticlesService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.articlesService.get().then(c => {
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    // console.log(`/entrepots/${e.data.id}`)
    this.router.navigate([`/articles/${e.data.id}`]);
  }

}
