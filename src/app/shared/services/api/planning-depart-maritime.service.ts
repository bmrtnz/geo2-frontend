import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import PlanningDepartMaritime from "app/shared/models/planning-depart-maritime.model";
import DataSource from "devextreme/data/data_source";
import { map } from "rxjs/operators";
import { ApiService } from "../api.service";

export type QueryArgs = { societeCode: string, dateMin: string, dateMax: string };

@Injectable({
  providedIn: "root"
})
export class PlanningDepartMaritimeService extends ApiService {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, PlanningDepartMaritime);
  }

  getDatasource(variables: QueryArgs, columns: Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: options => this
          .getList(variables, columns)
          .pipe(map(res => res.data.allPlanningDepartMaritime))
          .toPromise(),
      }),
    });
  }

  getList(variables: QueryArgs, columns: Set<string>) {
    return this.apollo
      .query<{ allPlanningDepartMaritime: Partial<PlanningDepartMaritime[]> }>({
        query: gql(this.buildGraph(columns)),
        variables,
        fetchPolicy: "network-only",
      });
  }

  private buildGraph(body: Set<string>) {
    return ApiService.buildGraph("query",
      [{
        name: "allPlanningDepartMaritime",
        body,
        params: [
          { name: "societeCode", value: "societeCode", isVariable: true },
          { name: "dateMin", value: "dateMin", isVariable: true },
          { name: "dateMax", value: "dateMax", isVariable: true },
        ],
      }],
      [
        { name: "societeCode", type: "String", isOptionnal: false },
        { name: "dateMin", type: "LocalDateTime", isOptionnal: false },
        { name: "dateMax", type: "LocalDateTime", isOptionnal: false },
      ],
    );
  }
}
