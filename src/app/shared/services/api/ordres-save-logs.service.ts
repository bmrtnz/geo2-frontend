import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import OrdreSaveLog from "app/shared/models/ordre-save-log.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class OrdresSaveLogsService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, OrdreSaveLog);
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

            const query = await this.buildGetAll(1);
            type Response = {
              allOrdreSaveLog: RelayPage<OrdreSaveLog>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allOrdreSaveLog)
                resolve(this.asInstancedListCount(res.data.allOrdreSaveLog));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1);
            type Response = { ordreSaveLog: OrdreSaveLog };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.ordreSaveLog)
                resolve(new OrdreSaveLog(res.data.ordreSaveLog));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordreSaveLog: OrdreSaveLog };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ordreSaveLog)
            resolve(new OrdreSaveLog(res.data.ordreSaveLog));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = {
              allOrdreSaveLog: RelayPage<OrdreSaveLog>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allOrdreSaveLog) {
                resolve(this.asInstancedListCount(res.data.allOrdreSaveLog));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
