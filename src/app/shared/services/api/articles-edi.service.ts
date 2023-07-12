import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import EdiArticleClient from "app/shared/models/article-edi.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: 'root'
})
export class ArticlesEdiService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, EdiArticleClient);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ediArticleClient: EdiArticleClient };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ediArticleClient)
            resolve(new EdiArticleClient(res.data.ediArticleClient));
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

            type Response = { allEdiArticleClient: RelayPage<EdiArticleClient> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allEdiArticleClient) {
                resolve(this.asInstancedListCount(res.data.allEdiArticleClient));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  public saveEdiArticleClient(
    ediArticleClient: Partial<EdiArticleClient>,
    body: Set<string>
  ) {
    return this.apollo.mutate<{ saveEdiArticleClient: Partial<EdiArticleClient> }>({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { ediArticleClient },
    });
  }

}
