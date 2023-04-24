import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { Variete } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class VarietesService extends ApiService implements APIRead {
  listRegexp = /.\.*(?:id|description)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Variete);
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
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll(
              1,
              this.listRegexp,
            );
            type Response = { allVariete: RelayPage<Variete> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allVariete)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allVariete,
                    ),
                  );
              },
            );
          }),
        byKey: this.byKey(["id", "description"]),
      }),
    });
  }

  getList(search: string, columns: Array<string>) {
    return this.apollo
      .query<{ allVarieteList: Variete[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getDistinctDataSource(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {

            type Response = { allDistinctVariete: RelayPage<Variete> };
            const query = await this.buildDistinctQuery(columns.map(c => `edges.node.${c}`));
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allDistinctVariete) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allDistinctVariete,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return id =>
      new Promise(async (resolve) => {
        const variables = { id };
        const res = await this.apollo.query<{ variete: Variete }>({
          query: gql(this.buildGetOneGraph(columns)),
          variables,
        }).toPromise();
        resolve(new Variete(res.data.variete));
      });
  }

}
