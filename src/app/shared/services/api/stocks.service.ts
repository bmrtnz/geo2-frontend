import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import LigneReservation from "app/shared/models/ligne-reservation.model";
import Precal from "app/shared/models/precal.model";
import StockArticle from "app/shared/models/stock-article.model";
import StockReservation from "app/shared/models/stock-reservation.model";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { Stock } from "../../models/stock.model";
import { APIDistinct, APIRead, ApiService, RelayPage } from "../api.service";
import { functionBody, FunctionResponse } from "./functions.service";
import { StockMouvementsService } from "./stock-mouvements.service";

@Injectable({
  providedIn: "root",
})
export class StocksService extends ApiService implements APIRead, APIDistinct {
  fieldsFilter = /.*\.(?:id|raisonSocial|description)$/i;

  constructor(
    apollo: Apollo,
    private stockMouvementsService: StockMouvementsService
  ) {
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
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll();
            type Response = { allStock: RelayPage<Stock> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allStock)
                resolve(this.asInstancedListCount(res.data.allStock));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { stock: Stock };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.stock)
                resolve(new Stock(res.data.stock));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { stock: Stock };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.stock)
            resolve(new Stock(res.data.stock));
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

            type Response = { allStock: RelayPage<Stock> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allStock) {
                resolve(this.asInstancedListCount(res.data.allStock));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  allStockArticleList(
    columns: Array<string> | Set<string>,
    espece: string,
    variete?: string,
    origine?: string,
    modeCulture?: string,
    emballage?: string,
    bureauAchat?: string,
    groupeEmballage?: string,
  ) {
    return this.apollo.query<{ allStockArticleList: StockArticle[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allStockArticleList`,
              body: columns,
              params: [
                { name: "espece", value: "espece", isVariable: true },
                { name: "variete", value: "variete", isVariable: true },
                { name: "origine", value: "origine", isVariable: true },
                { name: "modeCulture", value: "modeCulture", isVariable: true },
                { name: "emballage", value: "emballage", isVariable: true },
                { name: "bureauAchat", value: "bureauAchat", isVariable: true },
                { name: "groupeEmballage", value: "groupeEmballage", isVariable: true },
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
            { name: "groupeEmballage", type: "String", isOptionnal: true },
          ]
        )
      ),
      variables: {
        espece,
        variete,
        origine,
        modeCulture,
        emballage,
        bureauAchat,
        groupeEmballage,
      },
      fetchPolicy: "network-only",
    });
  }

  /** Query fetching stock by article */
  allStockReservationList(article: string) {
    const columns = StockReservation.getFieldsName();
    columns.delete("stock");
    columns.add("stock.id");
    columns.add("stock.statutStock");
    return this.apollo.query<{ allStockReservationList: StockReservation[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allStockReservationList`,
              body: columns,
              params: [{ name: "article", value: "article", isVariable: true }],
            },
          ],
          [{ name: "article", type: "String", isOptionnal: false }]
        )
      ),
      variables: { article },
      fetchPolicy: "network-only",
    });
  }

  public getStockReservationDatasource(article: string) {
    return this.allStockReservationList(article).pipe(
      map(
        ({ data }) =>
          new DataSource({
            store: new ArrayStore({
              data: data.allStockReservationList,
              key: "id",
            }),
          })
      )
    );
  }

  /** Query fetching reservations by ordre-ligne */
  allLigneReservationList(ordreLigne: string) {
    return this.apollo.query<{ allLigneReservationList: LigneReservation[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allLigneReservationList`,
              body: LigneReservation.getFieldsName(),
              params: [
                { name: "ordreLigne", value: "ordreLigne", isVariable: true },
              ],
            },
          ],
          [{ name: "ordreLigne", type: "String", isOptionnal: false }]
        )
      ),
      variables: { ordreLigne },
      fetchPolicy: "network-only",
    });
  }

  public getLigneReservationDatasource(ordreLigne: string) {
    return this.allLigneReservationList(ordreLigne).pipe(
      map(
        ({ data }) =>
          new DataSource({
            store: new ArrayStore({
              data: data.allLigneReservationList,
              key: "id",
            }),
            remove: (key) =>
              this.stockMouvementsService
                .deleteStockMouvement(key)
                .toPromise() as Promise<any>,
          })
      )
    );
  }

  reservationStock(
    ordreId: string,
    articleId: string,
    societeId: string,
    stockId: string,
    quantite: number,
    commentaire: string
  ) {
    return this.apollo.query<{ reservationStock: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
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
              ],
            },
          ],
          [
            { name: "ordreId", type: "String", isOptionnal: false },
            { name: "articleId", type: "String", isOptionnal: false },
            { name: "societeId", type: "String", isOptionnal: false },
            { name: "stockId", type: "String", isOptionnal: false },
            { name: "quantite", type: "Int", isOptionnal: false },
            { name: "commentaire", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: {
        ordreId,
        articleId,
        societeId,
        stockId,
        quantite,
        commentaire,
      },
      fetchPolicy: "network-only",
    });
  }

  takeOptionStock(
    quantite: number,
    stockId: string,
    propCode: string,
    palCode: string,
    stockDescription: string
  ) {
    return this.apollo.query<{ takeOptionStock: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "takeOptionStock",
              body: functionBody,
              params: [
                { name: "propCode", value: "propCode", isVariable: true },
                { name: "stockId", value: "stockId", isVariable: true },
                { name: "quantite", value: "quantite", isVariable: true },
                { name: "palCode", value: "palCode", isVariable: true },
                {
                  name: "stockDescription",
                  value: "stockDescription",
                  isVariable: true,
                },
              ],
            },
          ],
          [
            { name: "propCode", type: "String", isOptionnal: false },
            { name: "stockId", type: "String", isOptionnal: false },
            { name: "quantite", type: "Int", isOptionnal: false },
            { name: "palCode", type: "String", isOptionnal: false },
            { name: "stockDescription", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: { propCode, stockId, quantite, palCode, stockDescription },
      fetchPolicy: "network-only",
    });
  }

  public getDistinctEntityDatasource(
    fieldName,
    descriptionField?,
    searchExpr?
  ) {
    return this.getDistinctDatasource(
      "GeoStock",
      fieldName,
      descriptionField,
      searchExpr
    );
  }

  /** Query fetching stock precalibré */
  allPreca(
    codeEspece: string,
    semaine: string,
    codeModeCulture?: string,
    codeVariete?: string,
    codeFournisseur?: string
  ) {
    const columns = Precal.getFieldsName();
    columns.delete("variete");
    columns.delete("fournisseur");
    columns.delete("modeCulture");
    columns.add("variete.id");
    columns.add("fournisseur.code");
    columns.add("modeCulture.description");
    return this.apollo.query<{ allPreca: Precal[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allPreca`,
              body: columns,
              params: [
                { name: "codeEspece", value: "codeEspece", isVariable: true },
                { name: "semaine", value: "semaine", isVariable: true },
                {
                  name: "codeModeCulture",
                  value: "codeModeCulture",
                  isVariable: true,
                },
                { name: "codeVariete", value: "codeVariete", isVariable: true },
                {
                  name: "codeFournisseur",
                  value: "codeFournisseur",
                  isVariable: true,
                },
              ],
            },
          ],
          [
            { name: "codeEspece", type: "String", isOptionnal: false },
            { name: "semaine", type: "String", isOptionnal: false },
            { name: "codeModeCulture", type: "String", isOptionnal: true },
            { name: "codeVariete", type: "String", isOptionnal: true },
            { name: "codeFournisseur", type: "String", isOptionnal: true },
          ]
        )
      ),
      variables: {
        codeEspece,
        semaine,
        codeModeCulture,
        codeVariete,
        codeFournisseur,
      },
      fetchPolicy: "network-only",
    });
  }

  allPrecaEspece() {
    return this.apollo.query<{ allPrecaEspece: String[] }>({
      query: gql(
        ApiService.buildGraph("query", [
          {
            name: `allPrecaEspece`,
          },
        ])
      ),
      fetchPolicy: "network-only",
    });
  }

  allPrecaVariete(espece: String) {
    return this.apollo.query<{
      allPrecaVariete: { id: String; description: String }[];
    }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allPrecaVariete`,
              body: new Set(["id", "description"]),
              params: [{ name: "espece", value: "espece", isVariable: true }],
            },
          ],
          [{ name: "espece", type: "String", isOptionnal: false }]
        )
      ),
      variables: { espece },
      fetchPolicy: "network-only",
    });
  }

  refreshStockHebdo() {
    return this.apollo.query<{ refreshStockHebdo }>({
      query: gql(
        ApiService.buildGraph("query", [
          {
            name: `refreshStockHebdo`,
            body: functionBody,
          },
        ])
      ),
      fetchPolicy: "network-only",
    });
  }

  /**
   * Récupération du récap stock article
   */
  public allDetailStockResa(
    article: string,
    fournisseur: string,
    columns: string[]
  ) {
    return this.apollo.query<{ allDetailStockResa }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allDetailStockResa`,
              body: columns,
              params: [
                { name: "article", value: "article", isVariable: true },
                { name: "fournisseur", value: "fournisseur", isVariable: true },
              ],
            },
          ],
          [
            { name: "article", type: "String", isOptionnal: false },
            { name: "fournisseur", type: "String", isOptionnal: true },
          ]
        )
      ),
      variables: { article, fournisseur },
      fetchPolicy: "no-cache",
    });
  }


}
