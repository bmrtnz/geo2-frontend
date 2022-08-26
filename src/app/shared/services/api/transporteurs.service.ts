import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { Transporteur } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class TransporteursService extends ApiService implements APIRead {
  fieldsFilter =
    /.*\.(?:id|raisonSocial|description|ville|codePostal|adresse1|valide|typeTiers)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Transporteur);
  }

  getOne(id: string) {
    type Response = { transporteur: Transporteur };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ transporteur: Transporteur }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => res.loading === false));
  }

  getList(search: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ allTransporteurList: Transporteur[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "cache-first",
      })
      .pipe(takeWhile(res => !res.loading));
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: "id" }],
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
            type Response = {
              allTransporteur: RelayPage<Transporteur>;
            };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allTransporteur)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allTransporteur,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { transporteur: Transporteur };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.transporteur)
                  resolve(
                    new Transporteur(res.data.transporteur),
                  );
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


}
