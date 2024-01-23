import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import PlanningDepart from "app/shared/models/planning-depart.model";
import DataSource from "devextreme/data/data_source";
import { map, tap } from "rxjs/operators";
import { ApiService, Pageable, RelayPage } from "../api.service";

export type QueryArgs = {
  societeCode: string;
  secteurCode: string;
  dateMin: string;
  dateMax: string;
};

@Injectable({
  providedIn: "root",
})
export class PlanningDepartService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, PlanningDepart);
  }

  getDataSource(variables: QueryArgs, columns: Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options) =>
          this.getPage({
            pageable: this.mapLoadOptionsToVariables(options).pageable,
            ...variables,
          }, columns)
            .pipe(map((res) => res.data.allPlanningDepart))
            .toPromise(),
      }),
    });
  }

  getPage(variables: QueryArgs & { pageable: Pageable }, columns: Set<string>) {
    return this.apollo.query<{ allPlanningDepart: RelayPage<Partial<PlanningDepart>> }>({
      query: gql(this.buildGraph(columns)),
      variables,
      fetchPolicy: "network-only",
    });
  }

  private buildGraph(body: Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `allPlanningDepart`,
          body: [
            "pageInfo.startCursor",
            "pageInfo.endCursor",
            "pageInfo.hasPreviousPage",
            "pageInfo.hasNextPage",
            "totalCount",
            ...[...body].map((c) => `edges.node.${c}`),
          ],
          params: [
            { name: "societeCode", value: "societeCode", isVariable: true },
            { name: "secteurCode", value: "secteurCode", isVariable: true },
            { name: "dateMin", value: "dateMin", isVariable: true },
            { name: "dateMax", value: "dateMax", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
          ],
        },
      ],
      [
        { name: "societeCode", type: "String", isOptionnal: false },
        { name: "secteurCode", type: "String", isOptionnal: false },
        { name: "dateMin", type: "LocalDateTime", isOptionnal: false },
        { name: "dateMax", type: "LocalDateTime", isOptionnal: false },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
      ]
    );
  }
}
