import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import StockMouvement from "app/shared/models/stock-mouvement.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { ApiService, RelayPage } from "../api.service";
import { functionBody, FunctionResponse } from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class StockMouvementsService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, StockMouvement);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { stockMouvement: StockMouvement };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.stockMouvement)
            resolve(new StockMouvement(res.data.stockMouvement));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = { allStockMouvement: RelayPage<StockMouvement> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allStockMouvement) {
                resolve(this.asInstancedListCount(res.data.allStockMouvement));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  public saveStockMouvement(
    stockMouvement: Partial<StockMouvement>,
    body: Set<string>
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

  public deleteAllByOrdreLigneId(id: string) {
    return this.apollo.mutate<{ deleteStockMouvement: boolean }>({
      mutation: gql(
        ApiService.buildGraph(
          "mutation",
          [
            {
              name: `deleteAllByOrdreLigneId`,
              params: [{ name: "id", value: "id", isVariable: true }],
            },
          ],
          [{ name: "id", type: "String", isOptionnal: false }]
        )
      ),
      variables: { id },
    });
  }

  public fResaUneLigne = (
    fouCode: string,
    propCode: string,
    artRef: string,
    username: string,
    qteResa: number,
    ordRef: string,
    orlRef: string,
    desc: string,
    palCode: string
  ) =>
    this.apollo.query<{ fResaUneLigne: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
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
              ],
            },
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
          ]
        )
      ),
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
    });

  public fResaAutoOrdre = (ordRef: string, username: string) =>
    this.apollo.query<{ fResaAutoOrdre: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "fResaAutoOrdre",
              body: functionBody,
              params: [
                { name: "ordRef", value: "ordRef", isVariable: true },
                { name: "username", value: "username", isVariable: true },
              ],
            },
          ],
          [
            { name: "ordRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: {
        ordRef,
        username,
      },
      fetchPolicy: "network-only",
    });
}
