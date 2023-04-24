import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import PreEmballage from "app/shared/models/pre-emballage.model";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class PreEmballageService extends ApiService implements APIRead {
  listRegexp = /.\.*(?:id|description)$/i;

  constructor(apollo: Apollo) {
    super(apollo, PreEmballage);
    this.gqlKeyType = "GeoProduitWithEspeceIdInput";
  }

  getDataSource() {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() as string }],
      store: this.createCustomStore({
        key: ["id", "especeId"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll(
              1,
              this.listRegexp,
            );
            type Response = {
              allPreEmballage: RelayPage<PreEmballage>;
            };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allPreEmballage)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allPreEmballage,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { preEmballage: PreEmballage };
            const id = key
              ? { id: key.id, espece: key.especeId || "" }
              : {};
            const variables = { id };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.preEmballage)
                  resolve(
                    new PreEmballage(
                      res.data.preEmballage,
                    ),
                  );
              },
            );
          }),
      }),
    });
  }
}
