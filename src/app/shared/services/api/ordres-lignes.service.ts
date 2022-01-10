import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { OrdreLigne } from '../../models/ordre-ligne.model';
import { APIRead, ApiService, RelayPage, SummaryInput } from '../api.service';

export enum SummaryOperation {
  Marge = 'allOrdreLigneMarge',
  TotauxDetail = 'allOrdreLigneTotauxDetail',
  Totaux = 'allOrdreLigneTotaux'
}

@Injectable({
  providedIn: 'root'
})
export class OrdreLignesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreLigne);
  }

  /**
   * @deprecated Use getDataSource_v2
   */
  getDataSource(depth = 1, filter?: RegExp) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(depth, filter);
          type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigne)
              resolve(this.asInstancedListCount(res.data.allOrdreLigne));
          });
        }),
        byKey: this.byKey(depth, filter),
      }),
    });
  }

  private byKey_v2(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordreLigne: OrdreLigne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.ordreLigne)
            resolve(new OrdreLigne(res.data.ordreLigne));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
          const query = await this.buildGetAll_v2(columns);
          const variables = this.mapLoadOptionsToVariables(options);
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigne) {
              resolve(this.asInstancedListCount(res.data.allOrdreLigne));
            }
          });
        }),
        byKey: this.byKey_v2(columns),
      }),
    });
  }

  getSummarisedDatasource(
    operation: SummaryOperation,
    columns: Array<string>,
    summary: SummaryInput[]
  ) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = `
            query ${ operation.ucFirst() }($search: String!, $pageable: PaginationInput!, $summary: [SummaryInput]) {
              ${ operation }(search:$search, pageable:$pageable) {
                edges {
                  node {
                    ${await this.model.getGQLObservable(columns).toPromise()}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
                summary(summaries:$summary, of:"${ operation }")
              }
            }
          `;
          type Response = { [operation: string]: RelayPage<OrdreLigne> };
          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            summary,
          };

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data[operation])
              resolve(this.asInstancedListCount(res.data[operation]));
          });
        }),
        byKey: this.byKey_v2(columns),
      }),
    });
  }

  private byKey(depth: number, filter: RegExp) {
    return key => new Promise(async (resolve) => {
      const query = await this.buildGetOne(depth, filter);
      type Response = { ordreLigne: OrdreLigne };
      const variables = { id: key };
      this.listenQuery<Response>(query, { variables }, res => {
        if (res.data && res.data.ordreLigne)
          resolve(new OrdreLigne(res.data.ordreLigne));
      });
    });
  }
}
