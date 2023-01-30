import { Injectable } from "@angular/core";
import { gql } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import { Personne, Secteur, Societe } from "app/shared/models";
import PaysDepassement from "app/shared/models/pays-depassement.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class PaysDepassementService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, PaysDepassement);
  }

  getDataSource(body: Array<string>, variables: {
    secteurCode: Secteur["id"],
    societeCode: Societe["id"],
    commercialCode: Personne["id"],
    depassementOnly: boolean
  }) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => this.apollo
          .query<{ allPaysDepassementList: Array<PaysDepassement> }>({
            query: gql(ApiService.buildGraph(
              "query",
              [
                {
                  name: `all${this.model.name}List`,
                  body,
                  params: [
                    { name: "secteurCode", value: "secteurCode", isVariable: true },
                    { name: "societeCode", value: "societeCode", isVariable: true },
                    { name: "commercialCode", value: "commercialCode", isVariable: true },
                    { name: "depassementOnly", value: "depassementOnly", isVariable: true },
                  ],
                },
              ],
              [
                { name: "secteurCode", type: "String", isOptionnal: true },
                { name: "societeCode", type: "String", isOptionnal: true },
                { name: "commercialCode", type: "String", isOptionnal: true },
                { name: "depassementOnly", type: "Boolean", isOptionnal: true },
              ],
            )),
            variables,
            fetchPolicy: "network-only",
          })
          .pipe(map(res => res.data.allPaysDepassementList))
          .toPromise(),
      })
    });
  }

  count(variables: {
    secteurCode: Secteur["id"],
    societeCode: Societe["id"],
  }) {
    return this.apollo
      .query<{ countPaysDepassement: number }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: `count${this.model.name}`,
              params: [
                { name: "secteurCode", value: "secteurCode", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true }
              ],
            },
          ],
          [
            { name: "secteurCode", type: "String", isOptionnal: true },
            { name: "societeCode", type: "String", isOptionnal: true },
          ],
        )),
        variables,
        fetchPolicy: "network-only",
      });
  }
}
