import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map, takeWhile } from "rxjs/operators";
import { ApiService } from "../api.service";
import { CurrentCompanyService } from "../current-company.service";

export enum Indicateur {
  ClientsDepassementEncours = "ClientsDepassementEncours",
  OrdresNonConfirmes = "OrdresNonConfirmes",
  PlanningDepart = "PlanningDepart",
}

export type IndicateurCountResponse = { [key in keyof typeof Indicateur]: number };

@Injectable({
  providedIn: "root"
})
export class IndicateursService {

  constructor(
    private apollo: Apollo,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  /**
   * Request entities count from specified indicators
   */
  public countByIndicators(...indicateurs: Indicateur[]) {
    return this.apollo.query<IndicateurCountResponse>({
      query: gql(this.buildCountsGraph(...indicateurs)),
      fetchPolicy: "network-only",
      variables: {
        societeCode: this.currentCompanyService.getCompany().id,
        ...indicateurs.reduce((acm, crt) => ({ ...acm, [crt]: crt }), {}),
      },
    })
      .pipe(
        takeWhile(res => res.loading, true),
        map(res => res.data),
      );
  }

  private buildCountsGraph(...indicateurs: Indicateur[]) {
    return ApiService.buildGraph("query", indicateurs.map(alias =>
      ({
        name: "countByIndicator",
        alias,
        params: [
          { name: "indicateur", value: alias, isVariable: true },
          { name: "societeCode", value: "societeCode", isVariable: true },
        ],
      })
    ), indicateurs.map((name: string) =>
      ({ name, type: "Indicateur", isOptionnal: false })
    ).concat([
      { name: "societeCode", type: "String", isOptionnal: false },
    ]),
      "CountByIndicators");
  }
}
