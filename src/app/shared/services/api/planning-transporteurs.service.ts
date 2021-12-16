import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import PlanningTransporteur from 'app/shared/models/planning-transporteur.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PlanningTransporteursService extends ApiService implements APIRead {

  readonly operation = 'allPlanningTransporteurs';

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, PlanningTransporteur);
  }

  public persistantVariables: Record<string, any> = {};

  setPersisantVariables(params = this.persistantVariables) {
    this.persistantVariables = params;
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

          const query = await this.buildGetAllPlanningTransporteur(columns);
          type Response = { [operation: string]: RelayPage<PlanningTransporteur> };

          const variables = {
            ...this.persistantVariables,
            ...this.mapLoadOptionsToVariables(options)
          };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data[this.operation]) {
              resolve(this.asInstancedListCount(res.data[this.operation]));
            }
          });
        }),
        byKey: this.byKey(columns),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { planningTransporteur: PlanningTransporteur };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.planningTransporteur)
            resolve(new PlanningTransporteur(res.data.planningTransporteur));
        });
      });
  }

  protected async buildGetAllPlanningTransporteur(columns: Array<string>) {
    const alias = this.operation.ucFirst();
    return `
      query ${alias}(
        $search: String,
        $pageable: PaginationInput!,
        $dateMin: LocalDateTime!,
        $dateMax: LocalDateTime!,
        $societeCode: String!,
        $transporteurCode: String!
      ) {
        ${this.operation}(
          search:$search,
          pageable:$pageable,
          dateMin: $dateMin,
          dateMax: $dateMax,
          societeCode: $societeCode,
          transporteurCode: $transporteurCode
        ) {
          edges {
            node {
              ${await this.model.getGQL(columns).toPromise()}
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
  }

}
