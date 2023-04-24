import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { CodifDevalexp } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class CodifsDevalexpService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, CodifDevalexp);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { codifDevalexp: CodifDevalexp };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.codifDevalexp)
            resolve(new CodifDevalexp(res.data.codifDevalexp));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [
        { selector: this.model.getKeyField() as string }
      ],
      pageSize: 200,
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allCodifDevalexp: RelayPage<CodifDevalexp> };
          const query = await this.buildGetAll_v2(columns);
          const variables = this.mapLoadOptionsToVariables(options);
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allCodifDevalexp) {
              resolve(this.asInstancedListCount(res.data.allCodifDevalexp));
            }
          });
        }),
        byKey: this.byKey(columns),
      }),
    });
  }

}
