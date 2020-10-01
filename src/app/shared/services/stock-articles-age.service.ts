import { Injectable } from '@angular/core';
import { ApiService, RelayPage, APIRead, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { map, take, tap } from 'rxjs/operators';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { StockArticleAge } from '../models/stock-article-age.model';

@Injectable({
  providedIn: 'root'
})
export class StockArticlesAgeService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:article|age)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, StockArticleAge);
    this.gqlKeyType = 'GeoStockArticleAgeKeyInput';
  }

  byKey = (key) => {
    const query = this.buildGetOne();
    type Response = { stockArticleAge: StockArticleAge };
    const variables = { id: key };
    return this.
    query<Response>(query, { variables } as WatchQueryOptions<any>)
    .pipe(
      map( res => res.data.stockArticleAge),
      take(1),
    )
    .toPromise();
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = this.buildGetAll(3);
          type Response = { allStockArticleAge: RelayPage<StockArticleAge> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allStockArticleAge)),
            take(1),
          )
          .toPromise();
        },
        byKey: this.byKey,
      }),
    });
  }

  getFilterDatasource(selector: string) {
    const dt = new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const [value] = options.filter.slice(-1);
          options.filter = [ selector, '=', value ];
          return this
          .getDistinct({...options, group: {selector}})
          .toPromise();
        }
      }),
    });
    dt.group({selector});
    return dt;
  }

  getFetchDatasource() {
    return new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = `
            query FetchStock(
              $search: String,
              $pageable: PaginationInput!
            ){
              fetchStock(
                search:$search,
                pageable:$pageable
              ){
                edges {
                  node {
                    ${ this.model.getGQLFields(3) }
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
              }
            }
          `;

          type Response = { fetchStock: RelayPage<StockArticleAge> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.fetchStock)),
            take(1),
          )
          .toPromise();
        },
        byKey: this.byKey,
      }),
    });
  }

}
