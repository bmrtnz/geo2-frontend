import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Transitaire } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class TransitairesService extends ApiService implements APIRead {
  listRegexp = /.*(?:id|raisonSocial)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Transitaire);
  }

  /**
   * @deprecated Use getDataSource_v2
   */
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
              allTransitaire: RelayPage<Transitaire>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allTransitaire)
                resolve(this.asInstancedListCount(res.data.allTransitaire));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1, this.listRegexp);
            type Response = { transitaire: Transitaire };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.transitaire)
                resolve(new Transitaire(res.data.transitaire));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { transitaire: Transitaire };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.transitaire)
            resolve(new Transitaire(res.data.transitaire));
        });
      });
  }

  getDataSource_v2(columns: Array<string>, pageSize?) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      pageSize: pageSize ?? 20,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = { allTransitaire: RelayPage<Transitaire> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allTransitaire) {
                resolve(this.asInstancedListCount(res.data.allTransitaire));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
