import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { OrdreLigne } from '../../models/ordre-ligne.model';
import { APIRead, ApiService, RelayPage, SummarisedRelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdreLignesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreLigne);
  }

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

  getSummarisedDatasource(depth = 1, filter?: RegExp) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          if (!options.totalSummary)
            return resolve({});

          const query = `
            query AllOrdreLigneSummarised($search: String!, $pageable: PaginationInput!, $summary: [SummaryInput]) {
              allOrdreLigneSummarised(search:$search, pageable:$pageable, summary:$summary) {
                edges {
                  node {
                    ${await OrdreLigne.getGQLFields(depth, filter, null, {noList: true}).toPromise()}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
                summary
              }
            }
          `;
          type Response = { allOrdreLigneSummarised: SummarisedRelayPage<OrdreLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigneSummarised)
              resolve(this.asInstancedListCount(res.data.allOrdreLigneSummarised));
          });
        }),
        byKey: this.byKey(depth, filter),
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
