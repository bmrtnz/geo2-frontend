import { Injectable } from "@angular/core";
import { gql, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import EntrepotTransporteurBassin from "app/shared/models/entrepot-transporteur-bassin.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { map, takeWhile } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { FormUtilsService } from "../form-utils.service";

@Injectable({
  providedIn: "root",
})
export class EntrepotsTransporteursBassinsService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
    private formUtils: FormUtilsService,
  ) {
    super(apollo, EntrepotTransporteurBassin);
  }

  getOne(id: number, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ entrepotTransporteurBassin: EntrepotTransporteurBassin }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getDataSource_v2(columns: Array<string> | Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {

            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll_v2(columns);
            type Response = { allEntrepotTransporteurBassin: RelayPage<EntrepotTransporteurBassin> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "network-only" },
              res => {
                if (res.data && res.data.allEntrepotTransporteurBassin)
                  resolve(
                    // map to mutable object by serializing & deserializing apollo data
                    JSON.parse(JSON.stringify(this.asInstancedListCount(
                      res.data.allEntrepotTransporteurBassin,
                    )))
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { entrepotTransporteurBassin: EntrepotTransporteurBassin };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              res => {
                if (res.data && res.data.entrepotTransporteurBassin)
                  resolve(new EntrepotTransporteurBassin(res.data.entrepotTransporteurBassin));
              },
            );
          }),
        insert: values =>
          this.apollo.mutate<{ saveEntrepotTransporteurBassin: EntrepotTransporteurBassin }>({
            mutation: gql(this.buildSaveGraph(["id", ...this.formUtils.extractPaths(values)])),
            variables: { entrepotTransporteurBassin: { id: null, ...this.formUtils.cleanTypenames(values) } },
          })
            .pipe(
              map(res => res.data.saveEntrepotTransporteurBassin),
            )
            .toPromise(),
        update: (id, values) =>
          this.apollo.mutate<{ saveEntrepotTransporteurBassin: EntrepotTransporteurBassin }>({
            mutation: gql(this.buildSaveGraph(["id", ...this.formUtils.extractPaths(values)])),
            variables: { entrepotTransporteurBassin: { id, ...this.formUtils.cleanTypenames(values) } },
          })
            .pipe(
              map(res => res.data.saveEntrepotTransporteurBassin),
            )
            .toPromise(),
        remove: id => this.apollo.mutate({
          mutation: gql(this.buildDeleteGraph("BigDecimal")),
          variables: { id },
        }).toPromise()
      },
      ),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

}
