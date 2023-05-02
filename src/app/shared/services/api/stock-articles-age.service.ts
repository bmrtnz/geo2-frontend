import { Injectable, Type } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Emballage, Origine, Variete } from "app/shared/models";
import { Model } from "app/shared/models/model";
import ArrayStore from "devextreme/data/array_store";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { StockArticleAge } from "../../models/stock-article-age.model";
import { APIRead, ApiService, RelayPage } from "../api.service";

type SubEntity = Variete | Origine | Emballage;

@Injectable({
  providedIn: "root",
})
export class StockArticlesAgeService extends ApiService implements APIRead {
  fieldsFilter = /.*\.(?:article|age)$/i;
  customVariables: { [key: string]: any | any[] } = {};

  constructor(apollo: Apollo) {
    super(apollo, StockArticleAge);
    this.gqlKeyType = "GeoStockArticleAgeKeyInput";
  }

  byKey = (key) =>
    new Promise(async (resolve) => {
      const query = await this.buildGetOne();
      type Response = { stockArticleAge: StockArticleAge };
      const variables = { id: key };
      this.listenQuery<Response>(query, { variables }, (res) => {
        if (res.data && res.data.stockArticleAge)
          resolve(new StockArticleAge(res.data.stockArticleAge));
      });
    });

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(3);
            type Response = {
              allStockArticleAge: RelayPage<StockArticleAge>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allStockArticleAge)
                resolve(this.asInstancedListCount(res.data.allStockArticleAge));
            });
          }),
        byKey: this.byKey,
      }),
    });
  }

  getFilterDatasource(selector: string) {
    const dt = new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const [value] = options.filter.slice(-1);
            options.filter = [selector, "=", value];
            return this.loadDistinctQuery(
              { ...options, group: { selector } },
              (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              }
            );
          }),
      }),
    });
    dt.group({ selector });
    return dt;
  }

  getFetchDatasource() {
    return new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = `
            query FetchStock(
              $societe: GeoSocieteInput,
              $secteurs: [GeoSecteurInput],
              $clients: [GeoClientInput],
              $fournisseurs: [GeoFournisseurInput],
              $search: String,
              $pageable: PaginationInput!
            ){
              fetchStock(
                societe:$societe,
                secteurs:$secteurs,
                clients:$clients,
                fournisseurs:$fournisseurs,
                search:$search,
                pageable:$pageable
              ){
                edges {
                  node {
                    ${await this.model.getGQLFields(2).toPromise()}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasPreviousPage
                  hasNextPage
                }
                totalCount
              }
            }
          `;

            type Response = {
              fetchStock: RelayPage<StockArticleAge>;
            };
            const variables = {
              ...this.mapLoadOptionsToVariables(options),
              ...this.customVariables,
            };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.fetchStock)
                resolve(this.asInstancedListCount(res.data.fetchStock));
            });
          }),
        byKey: this.byKey,
      }),
    });
  }

  /** Get distinct sub-entity list from Stock, by their class, filtered by espece */
  public subDistinct<T extends SubEntity>(
    entity: Type<T>,
    especeID: string,
    body?: Set<string>
  ) {
    if (!body)
      body = new Set([
        (entity as any).getKeyField(),
        (entity as any).getLabelField(),
      ]);
    const name = `subDistinctStock${entity.name}`;
    return this.apollo
      .query<{ [name: string]: Array<T> }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name,
                body,
                params: [
                  { name: "especeID", value: "especeID", isVariable: true },
                ],
              },
            ],
            [{ name: "especeID", type: "String", isOptionnal: false }]
          )
        ),
        variables: { especeID },
      })
      .pipe(map((res) => res.data[name]));
  }

  public getSubDistinctDataSource<T extends SubEntity>(
    entity: Type<T>,
    especeID: string,
    body?: Set<string>
  ) {
    return new DataSource({
      store: new CustomStore({
        key: (entity as any).getKeyField(),
        load: (options) => this.subDistinct(entity, especeID, body).toPromise(),
      }),
    });
  }
}
