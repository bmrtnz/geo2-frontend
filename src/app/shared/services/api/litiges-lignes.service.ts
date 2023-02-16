import { Injectable } from "@angular/core";
import { gql, OperationVariables, WatchQueryOptions } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigneForfait from "app/shared/models/litige-ligne-forfait.model";
import LitigeLigneTotaux from "app/shared/models/litige-ligne-totaux.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { take } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class LitigesLignesService extends ApiService implements APIRead {
  listRegexp = /.*\.(?:id)$/i;

  constructor(apollo: Apollo) {
    super(apollo, LitigeLigne);
  }

  getDataSource() {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() }],
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

            // const query = await this.buildGetAll(2, this.listRegexp);
            const query = await this.buildGetAll(3);
            type Response = {
              allLitigeLigne: RelayPage<LitigeLigne>;
            };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allLitigeLigne)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitigeLigne,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(
              1,
              this.listRegexp,
            );
            type Response = { litigeLigne: LitigeLigne };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.litigeLigne)
                  resolve(
                    new LitigeLigne(res.data.litigeLigne),
                  );
              },
            );
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { litigeLigne: LitigeLigne };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.litigeLigne)
            resolve(new LitigeLigne(res.data.litigeLigne));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() }],
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

            type Response = {
              allLitigeLigne: RelayPage<LitigeLigne>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allLitigeLigne) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitigeLigne,
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

  async getTotaux(litige: string) {
    const query = `
    query LitigeLigneTotaux($litige: String!) {
        litigeLigneTotaux(litige:$litige) {
          ${await LitigeLigneTotaux.getGQLFields().toPromise()}
        }
      }
    `;
    type Response = { litigeLigneTotaux: LitigeLigneTotaux };
    const variables: OperationVariables = { litige };
    return this.query<Response>(query, {
      variables,
      fetchPolicy: "no-cache",
      returnPartialData: false,
    } as WatchQueryOptions).pipe(take(1));
  }

  allLitigeLigneFait(litigeID: string, numeroLigne: string, body: Set<string>) {
    return this.apollo.query<{ allLitigeLigneFait: LitigeLigneFait[] }>({
      query: gql(ApiService.buildGraph("query", [
        {
          name: "allLitigeLigneFait",
          body,
          params: [
            { name: "litigeID", value: "litigeID", isVariable: true },
            { name: "numeroLigne", value: "numeroLigne", isVariable: true },
          ],
        }
      ], [
        { name: "litigeID", type: "String", isOptionnal: false },
        { name: "numeroLigne", type: "String", isOptionnal: false },
      ])),
      variables: { litigeID, numeroLigne },
    });
  }

  allLitigeLigneForfait(litigeID: string, body: Set<string>) {
    return this.apollo.query<{ allLitigeLigneForfait: LitigeLigneForfait[] }>({
      query: gql(ApiService.buildGraph("query", [
        {
          name: "allLitigeLigneForfait",
          body,
          params: [
            { name: "litigeID", value: "litigeID", isVariable: true },
          ],
        }
      ], [
        { name: "litigeID", type: "String", isOptionnal: false },
      ])),
      variables: { litigeID },
    });
  }

}
