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
  customVariables: {[key: string]: any|any[]} = {};

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, StockArticleAge);
    this.gqlKeyType = 'GeoStockArticleAgeKeyInput';
  }

  byKey = async (key) => {
    const query = await this.buildGetOne();
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
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(3);
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
        load: async (options: LoadOptions) => {

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
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = `
            query FetchStock(
              $societe: GeoSocieteInput,
              $secteurs: [GeoSecteurInput],
              $clients: [GeoClientInput],
              $fournisseurs: [GeoFournisseurInput],
              $search: String,
              $pageable: PaginationInput!
            ){
              fetchStock(
                societe:$societe,
                secteurs:$secteurs,
                clients:$clients,
                fournisseurs:$fournisseurs,
                search:$search,
                pageable:$pageable
              ){
                edges {
                  node {
                    ${ await this.model.getGQLFields(2).toPromise() }
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
          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            ...this.customVariables,
          };
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
