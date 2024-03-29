import { Injectable } from "@angular/core";
import { gql, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { Fournisseur } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class FournisseursService extends ApiService implements APIRead {
  byKeyFilter =
    /.*\.(?:id|code|raisonSocial|description|ville|valide|commentaire|userModification|dateModification|typeTiers)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Fournisseur);
  }

  getOne(id: string) {
    type Response = { fournisseur: Fournisseur };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables }, 2);
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ fournisseur: Fournisseur }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => res.loading === false));
  }

  getFournisseurByCode(code: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ fournisseurByCode: Fournisseur }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name: "fournisseurByCode",
                body: columns,
                params: [{ name: "code", value: "code", isVariable: true }],
              },
            ],
            [{ name: "code", type: "String", isOptionnal: false }]
          )
        ),
        variables: { code },
      })
      .pipe(takeWhile((res) => res.loading === false));
  }

  getList(search: string, columns: Array<string>) {
    return this.apollo
      .query<{ allFournisseurList: Fournisseur[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "network-only",
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
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll_v2(columns);
            type Response = { allFournisseur: RelayPage<Fournisseur> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allFournisseur)
                resolve(this.asInstancedListCount(res.data.allFournisseur));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { fournisseur: Fournisseur };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.fournisseur)
                resolve(new Fournisseur(res.data.fournisseur));
            });
          }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables }, 2, this.byKeyFilter);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }
}
