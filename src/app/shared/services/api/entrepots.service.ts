import { Injectable } from "@angular/core";
import { OperationVariables, gql } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Entrepot } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { takeWhile } from "rxjs/operators";
import { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root",
})
export class EntrepotsService extends ApiService implements APIRead {
  fieldsFilter = /.*\.(?:id|code|raisonSocial|ville|valide|typeTiers)$/i;

  constructor(
    apollo: Apollo,
    private authService: AuthService
  ) {
    super(apollo, Entrepot);
  }

  getOne(id: string) {
    type Response = { entrepot: Entrepot };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getOneByCodeAndsocieteId(code: string, societeId: string, columns: Set<string>) {
    return this.apollo.query<{ entrepotByCodeAndsocieteId: Entrepot }>({
      query: gql(ApiService.buildGraph(
        "query",
        [
          {
            name: "entrepotByCodeAndsocieteId",
            body: columns,
            params: [
              { name: "code", value: "code", isVariable: true },
              { name: "societeId", value: "societeId", isVariable: true }
            ],
          },
        ],
        [
          { name: "code", type: "String", isOptionnal: false },
          { name: "societeId", type: "String", isOptionnal: false }
        ],
      )),
      variables: { code, societeId },
    });
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ entrepot: Entrepot }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => !res.loading));
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
            type Response = { allEntrepot: RelayPage<Entrepot> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allEntrepot)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allEntrepot,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { entrepot: Entrepot };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.entrepot)
                  resolve(new Entrepot(res.data.entrepot));
              },
            );
          }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

  disableCreation(societeID, codeClient) {   // Some companies/clients can't create new ones
    const disable = !this.authService.currentUser.adminClient
      && (
        (societeID === "IMP")
        || ((societeID === "BWS") && ["BWSTOCK", "BWS GBP", "BWSTOCKGBPAL", "BWSTOCK GB"].includes(codeClient))
      );
    return disable;
  }
}
