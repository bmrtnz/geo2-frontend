import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { HistoriqueLogistique } from "app/shared/models";
import { FunctionsService } from "app/shared/services/api/functions.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { AuthService } from "..";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class HistoriqueLogistiqueService extends ApiService implements APIRead {
  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    public authService: AuthService
  ) {
    super(apollo, HistoriqueLogistique);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { historiqueLogistique: HistoriqueLogistique };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.historiqueLogistique)
            resolve(new HistoriqueLogistique(res.data.historiqueLogistique));
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

            type Response = {
              allHistoriqueLogistique: RelayPage<HistoriqueLogistique>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allHistoriqueLogistique) {
                resolve(
                  this.asInstancedListCount(res.data.allHistoriqueLogistique)
                );
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{
      saveHistoriqueLogistique: HistoriqueLogistique;
    }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }
}
