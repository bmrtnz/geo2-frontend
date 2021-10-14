import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { MRUOrdre } from 'app/shared/models/mru-ordre.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class MruOrdresService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MRUOrdre);
    this.gqlKeyType = 'GeoMRUOrdreKeyInput';
  }

  private byKey(depth: number, filter?: RegExp) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne(depth, filter);
        type Response = { MRUOrdre: MRUOrdre };
        const id = key ? {
          utilisateur: key.utilisateur || '',
          ordre: key.ordre || '',
        } : {};
        const variables = { id };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.MRUOrdre)
            resolve(new MRUOrdre(res.data.MRUOrdre));
        });
      });
  }

  getDataSource(depth = 2, filter?: RegExp, option ?: {forceFilter?: boolean}) {
    return new DataSource({
      store: this.createCustomStore({
        key: ['utilisateur', 'ordre'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allMRUOrdre: RelayPage<MRUOrdre> };
          const query = await this.buildGetAll(depth, filter, null, option);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allMRUOrdre)
              resolve(this.asInstancedListCount(res.data.allMRUOrdre));
          });
        }),
        byKey: this.byKey(depth, filter),
      }),
    });
  }

  getDataSourceGrouped() {
    return new DataSource({
      store: this.createCustomStore({
        key: ['utilisateur', 'ordre'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allGroupedMRUOrdre: RelayPage<MRUOrdre> };
          const query = `
            query AllGroupedMRUOrdre($search: String, $pageable: PaginationInput!) {
              allGroupedMRUOrdre(search:$search, pageable:$pageable) {
                edges {
                  node {
                    ${await this.model.getGQLFields(2, undefined, null, {noList: true}).toPromise()}
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
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allGroupedMRUOrdre)
              resolve(this.asInstancedListCount(res.data.allGroupedMRUOrdre));
          });
        }),
        byKey: this.byKey(2),
      }),
    });
  }

}
