import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { HistoriqueModificationDetail } from "app/shared/models";
import { FunctionsService } from "app/shared/services/api/functions.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { AuthService } from "..";
import { APIRead, ApiService, RelayPage } from "../api.service";

type GQLResponse = {
  countHistoriqueModificationDetail: number;
};
@Injectable({
  providedIn: "root"
})
export class HistoriqueModificationsDetailService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    public authService: AuthService
  ) {
    super(apollo, HistoriqueModificationDetail);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { historiqueModificationDetail: HistoriqueModificationDetail };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.historiqueModificationDetail)
            resolve(new HistoriqueModificationDetail(res.data.historiqueModificationDetail));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() }],
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

            type Response = { allHistoriqueModificationDetail: RelayPage<HistoriqueModificationDetail> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allHistoriqueModificationDetail) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allHistoriqueModificationDetail,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveHistoriqueModificationDetail: HistoriqueModificationDetail }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }

  public countModifDetailHistoryById(logistiqueId) {
    return this.countModifDetailHistory(this.mapDXFilterToRSQL(["logistique.id", "=", logistiqueId]));
  }

  public countModifDetailHistory(search): Promise<any> {
    return new Promise(async (resolve) => {
      this.listenQuery<GQLResponse>(
        await this.buildCount(),
        {
          variables: { search },
          fetchPolicy: "no-cache",
        },
        (res) => resolve(res.data),
      );
    });
  }

}
