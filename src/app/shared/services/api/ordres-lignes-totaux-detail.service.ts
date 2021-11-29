import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import OrdreLigneTotauxDetail from 'app/shared/models/ordre-ligne-totaux-detail.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdreLignesTotauxDetailService extends ApiService {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreLigneTotauxDetail);
  }

  getTotauxDetailDataSource(ordre: string) {
    return new DataSource({
      store: this.createCustomStore({
        key: 'fournisseur.id',
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (!options.totalSummary)
          return resolve({});

          type Response = { allOrdreLigneTotauxDetail: RelayPage<OrdreLigneTotauxDetail> };
          const queryName = 'allOrdreLigneTotauxDetail';
          const query = `
            query AllOrdreLigneTotauxDetail($ordre: String!, $pageable: PaginationInput!, $summary: [SummaryInput]) {
              ${ queryName }(ordre:$ordre, pageable:$pageable) {
                edges {
                  node {
                    ${await OrdreLigneTotauxDetail.getGQLFields(1, undefined, null, {noList: true}).toPromise()}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
                summary(summaries:$summary, of:"${ queryName }")
              }
            }
          `;

          const variables = { ...this.mapLoadOptionsToVariables(options), ordre };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigneTotauxDetail)
              resolve(this.asInstancedListCount(res.data.allOrdreLigneTotauxDetail, v => new OrdreLigneTotauxDetail(v)));
          });

        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1);
          type Response = { ordreLigneTotauxDetail: OrdreLigneTotauxDetail };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordreLigneTotauxDetail)
              resolve(new OrdreLigneTotauxDetail(res.data.ordreLigneTotauxDetail));
          });
        }),
      }),
    });
  }

}
