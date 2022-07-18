import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import StockMouvement from "app/shared/models/stock-mouvement.model";
import { ApiService } from "../api.service";
import { functionBody, FunctionResponse } from "./functions.service";

@Injectable({
  providedIn: "root"
})
export class StockMouvementsService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, StockMouvement);
  }

  public saveStockMouvement(
    stockMouvement: Partial<StockMouvement>,
    body: Set<string>,
  ) {
    return this.apollo.mutate<{ saveStockMouvement: Partial<StockMouvement> }>({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { stockMouvement },
    });
  }

  public deleteStockMouvement(id: string) {
    return this.apollo.mutate<{ deleteStockMouvement: boolean }>({
      mutation: gql(this.buildDeleteGraph()),
      variables: { id },
    });
  }

  public fResaUneLigne =
    (
      fouCode: string,
      propCode: string,
      artRef: string,
      username: string,
      qteResa: number,
      ordRef: string,
      orlRef: string,
      desc: string,
      palCode: string,
    ) => this.apollo
      .query<{ fResaUneLigne: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fResaUneLigne",
              body: functionBody,
              params: [
                { name: "fouCode", value: "fouCode", isVariable: true },
                { name: "propCode", value: "propCode", isVariable: true },
                { name: "artRef", value: "artRef", isVariable: true },
                { name: "username", value: "username", isVariable: true },
                { name: "qteResa", value: "qteResa", isVariable: true },
                { name: "ordRef", value: "ordRef", isVariable: true },
                { name: "orlRef", value: "orlRef", isVariable: true },
                { name: "desc", value: "desc", isVariable: true },
                { name: "palCode", value: "palCode", isVariable: true },
              ]
            }
          ],
          [
            { name: "fouCode", type: "String", isOptionnal: false },
            { name: "propCode", type: "String", isOptionnal: false },
            { name: "artRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false },
            { name: "qteResa", type: "Int", isOptionnal: false },
            { name: "ordRef", type: "String", isOptionnal: false },
            { name: "orlRef", type: "String", isOptionnal: false },
            { name: "desc", type: "String", isOptionnal: false },
            { name: "palCode", type: "String", isOptionnal: false },
          ],
        )),
        variables: {
          fouCode,
          propCode,
          artRef,
          username,
          qteResa,
          ordRef,
          orlRef,
          desc,
          palCode,
        },
        fetchPolicy: "network-only",
      })
}
