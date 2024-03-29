import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Sucre } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class SucresService extends ApiService implements APIRead {
  listRegexp = /.\.*(?:id|description)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Sucre);
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
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(1, this.listRegexp);
            type Response = { allSucre: RelayPage<Sucre> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allSucre)
                resolve(this.asInstancedListCount(res.data.allSucre));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { sucre: Sucre };
            const id = key ? { id: key.id, espece: key.especeId || "" } : {};
            const variables = { id };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.sucre)
                resolve(new Sucre(res.data.sucre));
            });
          }),
      }),
    });
  }
}
