import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Flux } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class FluxService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, Flux);
  }

  getDataSource() {
    return new DataSource({
      sort: [{ selector: "id" }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll();
            type Response = { allFlux: RelayPage<Flux> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allFlux)
                resolve(this.asInstancedListCount(res.data.allFlux));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { flux: Flux };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.flux) resolve(new Flux(res.data.flux));
            });
          }),
      }),
    });
  }

  /** Douanes when CUSINV and mail as mean */
  mailsDouanes() {
    return [
      {
        id: 0,
        description: "Douane Montauban",
        mail: "douane_montauban@blue-whale.com"
      },
      {
        id: 1,
        description: "Douane Avignon",
        mail: "douaneavignon@blue-whale.com"
      },
    ];
  }

}
