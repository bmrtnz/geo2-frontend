import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map } from "rxjs/operators";
import { ApiService } from "../api.service";

export enum Indicateur {
  ClientsDepassementEncours = "ClientsDepassementEncours",
}

@Injectable({
  providedIn: "root"
})
export class IndicateursService {

  constructor(
    private apollo: Apollo,
  ) { }

  /**
   * Request entities count from specified indicators
   */
  public countByIndicators(...indicateurs: Indicateur[]) {
    return this.apollo.query<{ [key in keyof typeof Indicateur]: number }>({
      query: gql(this.buildCountsGraph(...indicateurs)),
      fetchPolicy: "network-only",
      variables: {
        ...indicateurs.reduce((acm, crt) => ({ ...acm, [crt]: crt }), {}),
      },
    }).pipe(map(res => res.data));
  }

  private buildCountsGraph(...indicateurs: Indicateur[]) {
    return ApiService.buildGraph("query", indicateurs.map(alias =>
      ({
        name: "countByIndicator",
        alias,
        params: [
          { name: "indicateur", value: alias, isVariable: true },
        ],
      })
    ), indicateurs.map(name =>
      ({ name, type: "Indicateur", isOptionnal: false })
    ), "CountByIndicators");
  }
}
