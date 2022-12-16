import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import PlanningMaritime from "app/shared/models/planning-maritime.model";
import DataSource from "devextreme/data/data_source";
import { map, tap } from "rxjs/operators";
import { ApiService } from "../api.service";

export type QueryArgs = { societeCode: string, dateMin: string, dateMax: string };
export enum PlanningSide {
  Depart = "Depart",
  Arrive = "Arrive",
}

@Injectable({
  providedIn: "root"
})
export class PlanningMaritimeService extends ApiService {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, PlanningMaritime);
  }

  getDataSource(variables: QueryArgs, columns: Set<string>, side: PlanningSide) {
    return new DataSource({
      store: this.createCustomStore({
        load: options => this
          .getList(variables, columns, side)
          .pipe(
            map(res => res.data.allPlanningDepartMaritime),
            // Time formating
            tap(res => res.map(r => r.dateDepartPrevueFournisseurRaw = r.dateDepartPrevueFournisseur?.split("T")[1]))
          )
          .toPromise()
      }),
    });
  }

  getList(variables: QueryArgs, columns: Set<string>, side: PlanningSide) {
    return this.apollo
      .query<{ allPlanningDepartMaritime: Partial<PlanningMaritime[]> }>({
        query: gql(this.buildGraph(columns, side)),
        variables,
        fetchPolicy: "network-only",
      });
  }

  private buildGraph(body: Set<string>, side: PlanningSide) {
    return ApiService.buildGraph("query",
      [{
        name: `allPlanning${side}Maritime`,
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
