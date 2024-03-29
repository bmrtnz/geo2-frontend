import { Injectable } from "@angular/core";
import {
  gql,
  OperationVariables,
  WatchQueryOptions
} from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import LitigeLigneFait from "app/shared/models/litige-ligne-fait.model";
import LitigeLigneForfait from "app/shared/models/litige-ligne-forfait.model";
import LitigeLigneTotaux from "app/shared/models/litige-ligne-totaux.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { lastValueFrom } from "rxjs";
import { map, take } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { FormUtilsService } from "../form-utils.service";

@Injectable({
  providedIn: "root",
})
export class LitigesLignesService extends ApiService implements APIRead {
  constructor(apollo: Apollo, private formUtils: FormUtilsService) {
    super(apollo, LitigeLigne);
  }
  listRegexp = /.*\.(?:id)$/i;

  getOne_v2(id: LitigeLigne["id"], columns: Set<string>) {
    return this.apollo.query<{ litigeLigne: LitigeLigne }>({
      query: gql(this.buildGetOneGraph(columns)),
      variables: { id },
    });
  }

  getList(search: string, columns: Array<string>) {
    return this.apollo.query<{ allLitigeLigneList: LitigeLigne[] }>({
      query: gql(this.buildGetListGraph(columns)),
      variables: { search },
      fetchPolicy: "network-only",
    });
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
                  resolve(this.asListCount(res.data.distinct));
              });

            // const query = await this.buildGetAll(2, this.listRegexp);
            const query = await this.buildGetAll(3);
            type Response = {
              allLitigeLigne: RelayPage<LitigeLigne>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allLitigeLigne)
                resolve(this.asInstancedListCount(res.data.allLitigeLigne));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1, this.listRegexp);
            type Response = { litigeLigne: LitigeLigne };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.litigeLigne)
                resolve(new LitigeLigne(res.data.litigeLigne));
            });
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
      sort: [{ selector: this.model.getLabelField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = {
              allLitigeLigne: RelayPage<LitigeLigne>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "network-only" },
              (res) => {
                if (res.data && res.data.allLitigeLigne) {
                  resolve(this.asInstancedListCount(res.data.allLitigeLigne));
                }
              }
            );
          }),
        byKey: this.byKey(columns),
        remove: key => lastValueFrom(this.delete(key).pipe(map(() => null))),
      }),
    });
  }

  delete(id: LitigeLigne["id"]) {
    return this.apollo.mutate<{ deleteLitigeLigne }>({
      mutation: gql(this.buildDeleteGraph()),
      variables: { id },
    });
  }

  deleteLot(litigeID: Litige["id"], groupementID: LitigeLigne["numeroGroupementLitige"]) {
    return this.apollo.mutate<{ deleteLot }>({
      mutation: gql(ApiService.buildGraph(
        "mutation",
        [
          {
            name: 'deleteLot',
            params: [
              { name: "litigeID", value: "litigeID", isVariable: true },
              { name: "groupementID", value: "groupementID", isVariable: true },
            ],
          },
        ],
        [
          { name: "litigeID", type: "String", isOptionnal: false },
          { name: "groupementID", type: "String", isOptionnal: false },
        ]
      )),
      variables: { litigeID, groupementID },
    });
  }

  deleteAll(ids: Array<LitigeLigne["id"]>) {
    return this.apollo.mutate({
      mutation: gql(
        ApiService.buildGraph(
          "mutation",
          [
            {
              name: "deleteAllLitigeLigne",
              params: [{ name: "ids", value: "ids", isVariable: true }],
            },
          ],
          [{ name: "ids", type: "[String]", isOptionnal: false }]
        )
      ),
      variables: { ids },
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
      fetchPolicy: "no-cache",
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "allLitigeLigneFait",
              body,
              params: [
                { name: "litigeID", value: "litigeID", isVariable: true },
                { name: "numeroLigne", value: "numeroLigne", isVariable: true },
              ],
            },
          ],
          [
            { name: "litigeID", type: "String", isOptionnal: false },
            { name: "numeroLigne", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: { litigeID, numeroLigne },
    });
  }

  allLitigeLigneForfait(litigeID: string, body: Set<string>) {
    return this.apollo.query<{ allLitigeLigneForfait: LitigeLigneForfait[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "allLitigeLigneForfait",
              body,
              params: [
                { name: "litigeID", value: "litigeID", isVariable: true },
              ],
            },
          ],
          [{ name: "litigeID", type: "String", isOptionnal: false }]
        )
      ),
      variables: { litigeID },
      fetchPolicy: "network-only",
    });
  }

  save(body: Set<string>, litigeLigne: Partial<LitigeLigne>) {
    return this.apollo.mutate<{ saveLitigeLigne: Partial<LitigeLigne> }>({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { litigeLigne },
    });
  }

  saveAll(body: Set<string>, allLitigeLigne: Array<Partial<LitigeLigne>>) {
    return this.apollo.mutate<{
      saveAllLitigeLigne: Array<Partial<LitigeLigne>>;
    }>({
      mutation: gql(this.buildSaveAllGraph([...body])),
      variables: { allLitigeLigne },
    });
  }

  saveLot(body: Set<string>, lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]], litigeLigne: Partial<LitigeLigne>) {
    return this.apollo.mutate<{
      saveLot: Array<Partial<LitigeLigne>>;
    }>({
      mutation: gql(ApiService.buildGraph(
        "mutation",
        [
          {
            name: `saveLot`,
            body,
            params: [
              { name: `lot`, value: `lot`, isVariable: true, },
              { name: `litigeLigne`, value: `litigeLigne`, isVariable: true, },
            ],
          },
        ],
        [
          {
            name: `lot`,
            type: `[String]`,
            isOptionnal: false,
          },
          {
            name: `litigeLigne`,
            type: `Geo${this.model.name}Input`,
            isOptionnal: false,
          },
        ]
      )),
      variables: { lot, litigeLigne },
    });
  }

  allLitigeLigneFaitDatasource(
    litigeID: string,
    numeroLigne: string,
    body: Set<string>
  ) {
    const llBody = new Set(
      [...body].map((field) => field.replace("ligne.", ""))
    );
    return new DataSource({
      store: new CustomStore({
        key: "ligne.id",
        load: (options: LoadOptions) =>
          this.allLitigeLigneFait(litigeID, numeroLigne, body)
            .pipe(
              map((res) =>
                JSON.parse(JSON.stringify(res.data.allLitigeLigneFait)).map(
                  (i) => FormUtilsService.cleanTypenames(i)
                )
              )
            )
            .toPromise(),
        update: (key, values) => {
          return this.save(llBody, { id: key, ...values.ligne }).toPromise();
        },
        byKey: (key) => this.getOne_v2(key, llBody).toPromise(),
      }),
    });
  }

  allLitigeLigneForfaitDatasource(litigeID: string, body: Set<string>) {
    return new DataSource({
      store: new CustomStore({
        key: "id",
        load: (options: LoadOptions) =>
          this.allLitigeLigneForfait(litigeID, body)
            .pipe(
              map((res) =>
                JSON.parse(JSON.stringify(res.data.allLitigeLigneForfait)).map(
                  (i) => FormUtilsService.cleanTypenames(i)
                )
              )
            )
            .toPromise(),
        update: (key, values) => {
          return this.save(body, { id: key, ...values }).toPromise();
        },
        byKey: (key) => this.getOne_v2(key, body).toPromise(),
      }),
    });
  }
}
