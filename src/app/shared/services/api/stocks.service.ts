import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import StockArticle from "app/shared/models/stock-article.model";
import StockReservation from "app/shared/models/stock-reservation.model";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { Stock } from "../../models/stock.model";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { functionBody, FunctionResponse } from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class StocksService extends ApiService implements APIRead {
  fieldsFilter = /.*\.(?:id|raisonSocial|description)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Stock);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll();
            type Response = { allStock: RelayPage<Stock> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allStock)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allStock,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { stock: Stock };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.stock)
                  resolve(new Stock(res.data.stock));
              },
            );
          }),
      }),
    });
  }

  allStockArticleList(
    espece: string,
    variete?: string,
    origine?: string,
    modeCulture?: string,
    emballage?: string,
    bureauAchat?: string
  ) {
    return this.apollo
      .query<{ allStockArticleList: StockArticle[] }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: `allStockArticleList`,
              body: StockArticle.getFieldsName(),
              params: [
                { name: "espece", value: "espece", isVariable: true },
                { name: "variete", value: "variete", isVariable: true },
                { name: "origine", value: "origine", isVariable: true },
                { name: "modeCulture", value: "modeCulture", isVariable: true },
                { name: "emballage", value: "emballage", isVariable: true },
                { name: "bureauAchat", value: "bureauAchat", isVariable: true },
              ],
            },
          ],
          [
            { name: "espece", type: "String", isOptionnal: false },
            { name: "variete", type: "String", isOptionnal: true },
            { name: "origine", type: "String", isOptionnal: true },
            { name: "modeCulture", type: "String", isOptionnal: true },
            { name: "emballage", type: "String", isOptionnal: true },
            { name: "bureauAchat", type: "String", isOptionnal: true },
          ],
        )),
        variables: { espece, variete, origine, modeCulture, emballage, bureauAchat },
        fetchPolicy: "network-only",
      });
  }


  /** Query fetching stock by article */
  allStockReservationList(article: string) {
    return this.apollo
      .query<{ allStockReservationList: StockReservation[] }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: `allStockReservationList`,
              body: StockReservation.getFieldsName(),
              params: [
                { name: "article", value: "article", isVariable: true },
              ],
            },
          ],
          [
            { name: "article", type: "String", isOptionnal: false },
          ],
        )),
        variables: { article },
        fetchPolicy: "network-only",
      });
  }

  public getStockReservationDatasource(article: string) {
    return this.allStockReservationList(article)
      .pipe(map(({ data }) => new DataSource({
        store: new ArrayStore({
          data: data.allStockReservationList,
          key: "id",
        }),
      })));
  }

  reservationStock(ordreId: string, articleId: string, societeId: string, stockId: string, quantite: number, commentaire: string) {
    return this.apollo
      .watchQuery<{ reservationStock: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "reservationStock",
              body: functionBody,
              params: [
                { name: "ordreId", value: "ordreId", isVariable: true },
                { name: "articleId", value: "articleId", isVariable: true },
                { name: "societeId", value: "societeId", isVariable: true },
                { name: "stockId", value: "stockId", isVariable: true },
                { name: "quantite", value: "quantite", isVariable: true },
                { name: "commentaire", value: "commentaire", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreId", type: "String", isOptionnal: false },
            { name: "articleId", type: "String", isOptionnal: false },
            { name: "societeId", type: "String", isOptionnal: false },
            { name: "stockId", type: "String", isOptionnal: false },
            { name: "quantite", type: "Int", isOptionnal: false },
            { name: "commentaire", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreId, articleId, societeId, stockId, quantite, commentaire },
        fetchPolicy: "network-only",
      });
  }

}
