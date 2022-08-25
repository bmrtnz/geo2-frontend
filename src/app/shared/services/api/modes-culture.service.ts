import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { ModeCulture } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { OperationVariables } from "@apollo/client/core";

@Injectable({
  providedIn: "root"
})
export class ModesCultureService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, ModeCulture);
    this.gqlKeyType = "Int";
  }

  getOne(id: number) {
    type Response = { modeCulture: ModeCulture };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables }, 2);
  }

  /**
   * @deprecated Use getDataSource_v2
   */
  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allModeCulture: RelayPage<ModeCulture> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allModeCulture)
              resolve(this.asInstancedListCount(res.data.allModeCulture));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { modeCulture: ModeCulture };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.modeCulture)
              resolve(new ModeCulture(res.data.modeCulture));
          });
        }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { modeCulture: ModeCulture };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.modeCulture)
            resolve(new ModeCulture(res.data.modeCulture));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [
        { selector: this.model.getKeyField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allModeCulture: RelayPage<ModeCulture> };
          const query = await this.buildGetAll_v2(columns);
          const variables = this.mapLoadOptionsToVariables(options);
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allModeCulture) {
              resolve(this.asInstancedListCount(res.data.allModeCulture));
            }
          });
        }),
        byKey: this.byKey(columns),
      }),
    });
  }

}
