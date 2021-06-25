import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import LitigeLigneTotaux from 'app/shared/models/litige-ligne-totaux.model';
import LitigeLigne from 'app/shared/models/litige-ligne.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class LitigesLignesService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, LitigeLigne);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(2, this.listRegexp);
          type Response = { allLitigeLigne: RelayPage<LitigeLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allLitigeLigne)
              resolve(this.asInstancedListCount(res.data.allLitigeLigne));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { litigeLigne: LitigeLigne };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.litigeLigne)
              resolve(new LitigeLigne(res.data.litigeLigne));
          });
        }),
      }),
    });
  }

  getTotauxDataSource(litige: string) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allLitigeLigneTotaux: RelayPage<LitigeLigneTotaux> };
          const query = `
            query AllLitigeLigneTotaux($litige: String!, $pageable: PaginationInput!) {
              allLitigeLigneTotaux(litige:$litige, pageable:$pageable) {
                edges {
                  node {
                    ${await LitigeLigneTotaux.getGQLFields(1, undefined, null, {noList: true}).toPromise()}
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

          const variables = { ...this.mapLoadOptionsToVariables(options), litige };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allLitigeLigneTotaux)
              resolve(this.asInstancedListCount(res.data.allLitigeLigneTotaux, v => new LitigeLigneTotaux(v)));
          });

        }),
      }),
    });
  }

}
