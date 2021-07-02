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
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allOrdreLigneTotauxDetail: RelayPage<OrdreLigneTotauxDetail> };
          const query = `
            query AllOrdreLigneTotauxDetail($ordre: String!, $pageable: PaginationInput!) {
              allOrdreLigneTotauxDetail(ordre:$ordre, pageable:$pageable) {
                edges {
                  node {
                    ${await OrdreLigneTotauxDetail.getGQLFields(2, undefined, null, {noList: true}).toPromise()}
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

          const variables = { ...this.mapLoadOptionsToVariables(options), ordre };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigneTotauxDetail)
              resolve(this.asInstancedListCount(res.data.allOrdreLigneTotauxDetail, v => new OrdreLigneTotauxDetail(v)));
          });

        }),
      }),
    });
  }

}
