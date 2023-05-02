import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map, takeWhile } from "rxjs/operators";
import { ApiService } from "../api.service";
import { CurrentCompanyService } from "../current-company.service";

export enum Indicateur {
  ClientsDepassementEncours = "ClientsDepassementEncours",
  OrdresNonConfirmes = "OrdresNonConfirmes",
  PlanningDepart = "PlanningDepart",
  LitigeOuvert = "LitigeOuvert",
}

export type IndicateurCount = { count: number; secteur?: string };
export type IndicateurCountResponse = {
  [key in keyof typeof Indicateur]: IndicateurCount;
};

@Injectable({
  providedIn: "root",
})
export class IndicateursService {
  public secteur: string;

  constructor(
    private apollo: Apollo,
    private currentCompanyService: CurrentCompanyService
  ) {}

  /**
   * Request entities count from specified indicators
   */
  public countByIndicators(...indicateurs: Indicateur[]) {
    return this.apollo
      .query<IndicateurCountResponse>({
        query: gql(this.buildCountsGraph(...indicateurs)),
        fetchPolicy: "network-only",
        variables: {
          societeCode: this.currentCompanyService.getCompany().id,
          secteurCode: this.secteur,
          ...indicateurs.reduce((acm, crt) => ({ ...acm, [crt]: crt }), {}),
        },
      })
      .pipe(
        takeWhile((res) => res.loading, true),
        map((res) => res.data)
      );
  }

  private buildCountsGraph(...indicateurs: Indicateur[]) {
    return ApiService.buildGraph(
      "query",
      indicateurs.map((alias) => ({
        name: "countByIndicator",
        alias,
        body: ["count", "secteur"],
        params: [
          { name: "indicateur", value: alias, isVariable: true },
          { name: "societeCode", value: "societeCode", isVariable: true },
          { name: "secteurCode", value: "secteurCode", isVariable: true },
        ],
      })),
      indicateurs
        .map((name: string) => ({
          name,
          type: "Indicateur",
          isOptionnal: false,
        }))
        .concat([
          { name: "societeCode", type: "String", isOptionnal: false },
          { name: "secteurCode", type: "String", isOptionnal: true },
        ]),
      "CountByIndicators"
    );
  }
}
