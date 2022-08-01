import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { StockArticleAge } from "../../models/stock-article-age.model";
import { APIRead, ApiService, Pageable, RelayPage } from "../api.service";

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
    })

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll(3);
            type Response = {
              allStockArticleAge: RelayPage<StockArticleAge>;
            };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allStockArticleAge)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allStockArticleAge,
                    ),
                  );
              },
            );
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
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const [value] = options.filter.slice(-1);
            options.filter = [selector, "=", value];
            return this.loadDistinctQuery(
              { ...options, group: { selector } },
              (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              },
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
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
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
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.fetchStock)
                  resolve(
                    this.asInstancedListCount(
                      res.data.fetchStock,
                    ),
                  );
              },
            );
          }),
        byKey: this.byKey,
      }),
    });
  }

  public getDistinctEntityDatasource(fieldName, searchExpr?) {
    return this.apollo.query<{ distinct: RelayPage<{ count: number, key: string, description: string }> }>({
      query: gql(this.buildDistinctGraph()),
      variables: {
        field: fieldName, // E.g. "espece.id"
        type: "GeoStockArticleAge",
        search: searchExpr,
        pageable: {
          pageNumber: 0,
          pageSize: 500,
        } as Pageable,
      },
    }).pipe(
      map(res => new DataSource({
        store: new ArrayStore({
          data: res.data.distinct.edges,
        }),
        key: "key",
      })),
    );
  }

}
