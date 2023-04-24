import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DepotEnvoi from "app/shared/models/depot-envoi.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class DepotEnvoisService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, DepotEnvoi);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { depotEnvoi: DepotEnvoi };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.depotEnvoi)
            resolve(new DepotEnvoi(res.data.depotEnvoi));
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
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            type Response = {
              allDepotEnvoi: RelayPage<DepotEnvoi>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              {
                variables,
                fetchPolicy: "network-only" // to work with editable dx-grid
              },
              (res) => {
                if (res.data && res.data.allDepotEnvoi) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allDepotEnvoi,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
        insert: (values) => {
          const variables = { ordreFrais: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { ordreFrais: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({ variables }).toPromise<any>();
        },
      }),
    });
  }

  save(depotEnvoi: Partial<DepotEnvoi>, columns: Array<string>) {
    return this.apollo.mutate<{ saveDepotEnvoi: DepotEnvoi }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables: { depotEnvoi },
    });
  }
}
