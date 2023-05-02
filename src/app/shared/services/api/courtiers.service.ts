import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Courtier } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class CourtierService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, Courtier);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll();
            type Response = { allCourtier: RelayPage<Courtier> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCourtier)
                resolve(this.asInstancedListCount(res.data.allCourtier));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { courtier: Courtier };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.courtier)
                resolve(new Courtier(res.data.courtier));
            });
          }),
      }),
    });
  }
}
