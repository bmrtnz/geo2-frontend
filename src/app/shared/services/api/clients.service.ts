import { Injectable } from "@angular/core";
import { gql, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { Client } from "../../models";
import { APIPersist, APIRead, ApiService, RelayPage } from "../api.service";
import { FunctionsService } from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class ClientsService extends ApiService implements APIRead, APIPersist {
  fieldsFilter =
    /.*\.(?:id|code|raisonSocial|description|ville|valide|commentaire|userModification|dateModification|typeTiers)$/i;

  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService
  ) {
    super(apollo, Client);
  }

  getOne(id: string) {
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables }, 2);
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ client: Client }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => res.loading === false));
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: "code" }],
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

            const query = await this.buildGetAll_v2(columns);
            type Response = { allClient: RelayPage<Client> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allClient)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allClient,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { client: Client };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.client)
                  resolve(new Client(res.data.client));
              },
            );
          }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables }, 2, this.fieldsFilter);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

  /**
   * Récupération des en-cours client
   */
  public allClientEnCours(
    clientRef: string,
    columns: string[],
    deviseCodeRef?: string,
  ) {
    return this.apollo
      .query<{ allClientEnCours }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: `allClientEnCours`,
              body: columns,
              params: [
                { name: "clientRef", value: "clientRef", isVariable: true },
                { name: "deviseCodeRef", value: "deviseCodeRef", isVariable: true },
              ],
            },
          ],
          [
            { name: "clientRef", type: "String", isOptionnal: false },
            { name: "deviseCodeRef", type: "String", isOptionnal: true },
          ],
        )),
        variables: { clientRef, deviseCodeRef },
        fetchPolicy: "no-cache",
      });
  }

}
