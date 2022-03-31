import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { DefCodePromo } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class DefCodesPromoService extends ApiService implements APIRead {

  constructor(apollo: Apollo) {
    super(apollo, DefCodePromo);
    this.gqlKeyType = "GeoDefCodePromoIdInput";
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: "numeroTri" }],
      store: this.createCustomStore({
        key: ["codePromoId", "especeId", "varieteId"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll_v2(columns);
            type Response = { allDefCodePromo: RelayPage<DefCodePromo> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allDefCodePromo)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allDefCodePromo,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { defCodePromo: DefCodePromo };
            const id = key
              ? {
                codePromo: key.codePromoId || "",
                espece: key.especeId || "",
                variete: key.varieteId || "",
              }
              : {};
            const variables = { id };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.defCodePromo)
                  resolve(new DefCodePromo(res.data.defCodePromo));
              },
            );
          }),
      }),
    });
  }
}
