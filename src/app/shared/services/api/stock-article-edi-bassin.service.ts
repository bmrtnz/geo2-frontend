import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import StockArticleEdiBassin from "app/shared/models/stock-article-Edi-bassin.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: 'root'
})
export class StockArticleEdiBassinService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, StockArticleEdiBassin);
  }

  private byKey(columns: Set<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { stockArticleEdiBassin: StockArticleEdiBassin };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.stockArticleEdiBassin)
            resolve(new StockArticleEdiBassin(res.data.stockArticleEdiBassin));
        });
      });
  }

  getDataSource_v2(columns: Set<string>) {
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

            type Response = { allStockArticleEdiBassin: RelayPage<StockArticleEdiBassin> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables, fetchPolicy: "no-cache" }, (res) => {
              if (res.data && res.data.allStockArticleEdiBassin) {
                resolve(this.asInstancedListCount(res.data.allStockArticleEdiBassin));
              }
            });
          }),
        byKey: this.byKey(columns),
        insert: (values) => {
          const variables = { stockArticleEdiBassin: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { stockArticleEdiBassin: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({
            variables,
          }).toPromise() as unknown as PromiseLike<void>;
        },
      }),
    });
  }

  save(body: Set<string>, stockArticleEdiBassin: Partial<StockArticleEdiBassin>) {
    return this.apollo.mutate<{ saveStockArticleEdiBassin: Partial<StockArticleEdiBassin> }>({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { stockArticleEdiBassin },
    });
  }

}
