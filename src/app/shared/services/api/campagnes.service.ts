import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import Campagne from "app/shared/models/campagne.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class CampagnesService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, Campagne);
  }

  /**
   * @deprecated Use getDataSource_v2
   */
  getDataSource() {
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

            const query = await this.buildGetAll();
            type Response = { allCampagne: RelayPage<Campagne> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCampagne)
                resolve(this.asInstancedListCount(res.data.allCampagne));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { campagne: Campagne };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.campagne)
                resolve(new Campagne(res.data.campagne));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { campagne: Campagne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.campagne)
            resolve(new Campagne(res.data.campagne));
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

            type Response = { allCampagne: RelayPage<Campagne> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCampagne) {
                resolve(this.asInstancedListCount(res.data.allCampagne));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  getOne_v2(id: Campagne["id"], columns: Set<string>) {
    return this.apollo.query<{ campagne: Campagne }>({
      query: gql(this.buildGetOneGraph(columns)),
      variables: { id },
    });
  }
}
