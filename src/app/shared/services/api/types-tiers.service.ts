import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import TypeTiers from "app/shared/models/type-tiers.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class TypesTiersService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, TypeTiers);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { typeTiers: TypeTiers };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.typeTiers)
            resolve(new TypeTiers(res.data.typeTiers));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() }],
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

            type Response = { allTypeTiers: RelayPage<TypeTiers> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allTypeTiers) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allTypeTiers,
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
}
