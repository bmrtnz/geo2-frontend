import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import RaisonAnnuleRemplace from "app/shared/models/raison-annule-remplace.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class RaisonsAnnuleRemplaceService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, RaisonAnnuleRemplace);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { raisonAnnuleRemplace: RaisonAnnuleRemplace };
        const variables = { description: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.raisonAnnuleRemplace)
            resolve(new RaisonAnnuleRemplace(res.data.raisonAnnuleRemplace));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      pageSize: 100,
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

            type Response = { allRaisonAnnuleRemplace: RelayPage<RaisonAnnuleRemplace> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allRaisonAnnuleRemplace) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allRaisonAnnuleRemplace,
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
