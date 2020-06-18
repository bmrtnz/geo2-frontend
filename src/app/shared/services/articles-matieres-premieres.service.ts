import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Article } from '../models';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { ArticleMatierePremiere } from '../models/article-matiere-premiere.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArticlesMatieresPremieresService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Article);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, inputVariables).toPromise();

          const query = this.buildGetAll();
          type Response = { allArticleMatierePremiere: RelayPage<ArticleMatierePremiere> };
          const variables = {
            ...inputVariables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allArticleMatierePremiere)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne();
          type Response = { articleMatierePremiere: ArticleMatierePremiere };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.articleMatierePremiere),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
