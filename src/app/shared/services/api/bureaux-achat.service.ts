import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { BureauAchat } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class BureauxAchatService extends ApiService implements APIRead {
  listRegexp = /.*\.(?:id|raisonSocial)$/i;

  constructor(apollo: Apollo) {
    super(apollo, BureauAchat);
  }

  getDataSource() {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(1, this.listRegexp);
            type Response = {
              allBureauAchat: RelayPage<BureauAchat>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allBureauAchat)
                resolve(this.asInstancedListCount(res.data.allBureauAchat));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1, this.listRegexp);
            type Response = { bureauAchat: BureauAchat };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.bureauAchat)
                resolve(new BureauAchat(res.data.bureauAchat));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string> | Set<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { bureauAchat: BureauAchat };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.bureauAchat)
            resolve(new BureauAchat(res.data.bureauAchat));
        });
      });
  }

  getDataSource_v2(columns: Array<string> | Set<string>) {
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
              allBureauAchat: RelayPage<BureauAchat>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allBureauAchat) {
                resolve(this.asInstancedListCount(res.data.allBureauAchat));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
