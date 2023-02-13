import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import OrdreFraisLitige from "app/shared/models/ordre-frais-litige.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class OrdresFraisLitigeService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, OrdreFraisLitige);
  }

  getDataSource(depth = 1, filter?: RegExp) {
    return new DataSource({
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

            const query = await this.buildGetAll(depth, filter);
            type Response = {
              allOrdreFraisLitige: RelayPage<OrdreFraisLitige>;
            };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allOrdreFraisLitige)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allOrdreFraisLitige,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(depth, filter);
            type Response = { ordreFraisLitige: OrdreFraisLitige };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.ordreFraisLitige)
                  resolve(
                    new OrdreFraisLitige(res.data.ordreFraisLitige),
                  );
              },
            );
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordreFraisLitige: OrdreFraisLitige };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ordreFraisLitige)
            resolve(new OrdreFraisLitige(res.data.ordreFraisLitige));
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

            type Response = {
              allOrdreFraisLitige: RelayPage<OrdreFraisLitige>;
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
                if (res.data && res.data.allOrdreFraisLitige) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allOrdreFraisLitige,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
        insert: (values) => {
          const variables = { ordreFraisLitige: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { ordreFraisLitige: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({ variables }).toPromise();
        },
      }),
    });
  }
}
