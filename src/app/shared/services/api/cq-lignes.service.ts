import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import CQLigne from "app/shared/models/cq-ligne.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class CQLignesService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, CQLigne);
  }

  getOne_v2(id: CQLigne["id"], body: Set<string>) {
    return this.apollo
      .query<{ CQLigne: CQLigne }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name: this.model.name,
                body,
                params: [
                  {
                    name: this.model.getKeyField().toString(),
                    value: this.model.getKeyField().toString(),
                    isVariable: true,
                  },
                ],
              },
            ],
            [
              {
                name: this.model.getKeyField().toString(),
                type: this.gqlKeyType,
                isOptionnal: false,
              },
            ]
          )
        ),
        variables: { id },
        fetchPolicy: "cache-first",
      })
      .pipe(map((res) => res.data.CQLigne));
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
            type Response = { allCQLigne: RelayPage<CQLigne> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCQLigne)
                resolve(this.asInstancedListCount(res.data.allCQLigne));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1);
            type Response = { CQLigne: CQLigne };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.CQLigne)
                resolve(new CQLigne(res.data.CQLigne));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { CQLigne: CQLigne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.CQLigne)
            resolve(new CQLigne(res.data.CQLigne));
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

            type Response = { allCQLigne: RelayPage<CQLigne> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCQLigne) {
                resolve(this.asInstancedListCount(res.data.allCQLigne));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
