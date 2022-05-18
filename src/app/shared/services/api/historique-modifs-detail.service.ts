import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { HistoriqueModifDetail } from "app/shared/models";
import { FunctionsService } from "app/shared/services/api/functions.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { AuthService } from "..";
import { APIRead, ApiService, RelayPage } from "../api.service";


@Injectable({
  providedIn: "root"
})
export class HistoriqueModifsDetailService extends ApiService implements APIRead {


  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    public authService: AuthService
  ) {
    super(apollo, HistoriqueModifDetail);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { historiqueModifDetail: HistoriqueModifDetail };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.historiqueModifDetail)
            resolve(new HistoriqueModifDetail(res.data.historiqueModifDetail));
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

            type Response = { allHistoriqueModifDetail: RelayPage<HistoriqueModifDetail> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allHistoriqueModifDetail) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allHistoriqueModifDetail,
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
    return this.apollo.mutate<{ saveHistoriqueModifDetail: HistoriqueModifDetail }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }

}
