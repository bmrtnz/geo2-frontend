import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import FraisLitige from "app/shared/models/ordre-frais-litige.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class OrdresFraisLitigeService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, FraisLitige);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { fraisLitige: FraisLitige };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.fraisLitige)
            resolve(new FraisLitige(res.data.fraisLitige));
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
              allFraisLitige: RelayPage<FraisLitige>;
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
                if (res.data && res.data.allFraisLitige) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allFraisLitige,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
        insert: (values) => {
          const variables = { fraisLitige: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { fraisLitige: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({ variables }).toPromise() as unknown as PromiseLike<void>;
        },
      }),
    });
  }
}
