import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import Litige from "app/shared/models/litige.model";
import { APIRead, ApiService, RelayPage } from "../api.service";
import LitigeSupervision from "app/shared/models/litige-supervision.model";
import LitigeAPayer from "app/shared/models/litige-a-payer.model";
import { functionBody, FunctionResponse, FunctionsService } from "./functions.service";
import { OrdreLigne } from "app/shared/models";

export type ClotureResponse = FunctionResponse<{ triggered_prompt: string }>;

@Injectable({
  providedIn: "root",
})
export class LitigesService extends ApiService implements APIRead {
  listRegexp = /.*\.(?:id|libelle)$/i;

  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService
  ) {
    super(apollo, Litige);
  }

  getOne_v2(id: Litige["id"], columns: Set<string>) {
    return this.apollo
      .query<{ litige: Litige }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      });
  }

  getDataSource() {
    return new DataSource({
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

            const query = await this.buildGetAll(1);
            type Response = { allLitige: RelayPage<Litige> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allLitige)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitige,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1);
            type Response = { litige: Litige };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.litige)
                  resolve(new Litige(res.data.litige));
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
        type Response = { litige: Litige };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.litige)
            resolve(new Litige(res.data.litige));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() }],
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

            type Response = { allLitige: RelayPage<Litige> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "no-cache" },
              (res) => {
                if (res.data && res.data.allLitige) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitige,
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

  allSupervisionLitige(
    type: string,
    code: string,
    body: Set<string>,
  ) {
    return this.apollo.query<{ allSupervisionLitige: Partial<LitigeSupervision>[] }>({
      query: gql(ApiService.buildGraph("query",
        [{
          name: "allSupervisionLitige",
          body,
          params: [
            { name: "type", value: "type", isVariable: true },
            { name: "code", value: "code", isVariable: true },
          ],
        }],
        [
          { name: "type", type: "String", isOptionnal: false },
          { name: "code", type: "String", isOptionnal: false },
        ],
      )),
      variables: { code, type },
    });
  }

  getLitigesAPayer(litigeID: string, body: Set<string>) {
    return this.apollo.query<{ allLitigeAPayer: LitigeAPayer[] }>({
      query: gql(ApiService.buildGraph("query", [
        {
          name: "allLitigeAPayer",
          body,
          params: [{ name: "litigeID", value: "litigeID", isVariable: true }],
        }
      ], [{ name: "litigeID", type: "String", isOptionnal: false }])),
      variables: { litigeID },
    });
  }

  save(body: Set<string>, litige: Partial<Litige>) {
    return this.apollo.mutate<{ saveLitige: Partial<Litige> }>({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { litige },
    });
  }

  ofClotureLitigeClient(
    litigeRef: string,
    societeCode: string,
    prompts: {
      promptFraisAnnexe?: boolean,
      promptAvoirClient?: boolean,
      promptCreateAvoirClient?: boolean,
    },
  ) {
    return this.apollo
      .query<{ ofClotureLitigeClient: ClotureResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofClotureLitigeClient",
              body: functionBody,
              params: [
                { name: "litigeRef", value: "litigeRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "promptFraisAnnexe", value: "promptFraisAnnexe", isVariable: true },
                { name: "promptAvoirClient", value: "promptAvoirClient", isVariable: true },
                { name: "promptCreateAvoirClient", value: "promptCreateAvoirClient", isVariable: true },
              ]
            }
          ],
          [
            { name: "litigeRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "promptFraisAnnexe", type: "Boolean", isOptionnal: true },
            { name: "promptAvoirClient", type: "Boolean", isOptionnal: true },
            { name: "promptCreateAvoirClient", type: "Boolean", isOptionnal: true },
          ],
        )),
        variables: {
          litigeRef,
          societeCode,
          ...prompts
        },
        fetchPolicy: "network-only",
      });
  }

  ofClotureLitigeResponsable(
    litigeRef: string,
    societeCode: string,
    prompts: {
      promptAvoirResponsable?: boolean,
      promptCreateAvoirResponsable?: boolean,
      promptFraisAnnexe?: boolean,
    }) {
    return this.apollo
      .query<{ ofClotureLitigeResponsable: ClotureResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofClotureLitigeResponsable",
              body: functionBody,
              params: [
                { name: "litigeRef", value: "litigeRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "promptFraisAnnexe", value: "promptFraisAnnexe", isVariable: true },
                { name: "promptAvoirResponsable", value: "promptAvoirResponsable", isVariable: true },
                { name: "promptCreateAvoirResponsable", value: "promptCreateAvoirResponsable", isVariable: true },
              ]
            }
          ],
          [
            { name: "litigeRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "promptFraisAnnexe", type: "Boolean", isOptionnal: true },
            { name: "promptAvoirResponsable", type: "Boolean", isOptionnal: true },
            { name: "promptCreateAvoirResponsable", type: "Boolean", isOptionnal: true },
          ],
        )),
        variables: {
          litigeRef,
          societeCode,
          ...prompts,
        },
        fetchPolicy: "network-only",
      });
  }

  ofClotureLitigeGlobale(
    litigeRef: string,
    societeCode: string,
    prompts: {
      promptAvoirClient?: boolean,
      promptAvoirGlobal?: boolean,
      promptCreateAvoirGlobal?: boolean,
      promptFraisAnnexe?: boolean,
    },
  ) {
    return this.apollo
      .query<{ ofClotureLitigeGlobale: ClotureResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofClotureLitigeGlobale",
              body: functionBody,
              params: [
                { name: "litigeRef", value: "litigeRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "promptFraisAnnexe", value: "promptFraisAnnexe", isVariable: true },
                { name: "promptAvoirClient", value: "promptAvoirClient", isVariable: true },
                { name: "promptAvoirGlobal", value: "promptAvoirGlobal", isVariable: true },
                { name: "promptCreateAvoirGlobal", value: "promptCreateAvoirGlobal", isVariable: true },
              ]
            }
          ],
          [
            { name: "litigeRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "promptFraisAnnexe", type: "Boolean", isOptionnal: true },
            { name: "promptAvoirClient", type: "Boolean", isOptionnal: true },
            { name: "promptAvoirGlobal", type: "Boolean", isOptionnal: true },
            { name: "promptCreateAvoirGlobal", type: "Boolean", isOptionnal: true },
          ],
        )),
        variables: {
          litigeRef,
          societeCode,
          ...prompts,
        },
        fetchPolicy: "network-only",
      });
  }

  ofSauveLitige(litigeRef: string) {
    return this.apollo
      .query<{ ofSauveLitige: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofSauveLitige",
              body: functionBody,
              params: [
                { name: "litigeRef", value: "litigeRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "litigeRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { litigeRef },
        fetchPolicy: "network-only",
      });
  }

  ofChronoLitige(ordreOrigineRef: string) {
    return this.apollo
      .query<{ ofChronoLitige: FunctionResponse<{ is_cur_lit_ref: Litige["id"] }> }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofChronoLitige",
              body: functionBody,
              params: [
                { name: "ordreOrigineRef", value: "ordreOrigineRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreOrigineRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreOrigineRef },
        fetchPolicy: "network-only",
      });
  }

  ofLitigeCtlClientInsert(societeCode: string, ordreRef: string, litigeRef: string) {
    return this.apollo
      .query<{ ofLitigeCtlClientInsert: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofLitigeCtlClientInsert",
              body: functionBody,
              params: [
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "litigeRef", value: "litigeRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "litigeRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { societeCode, ordreRef, litigeRef },
        fetchPolicy: "network-only",
      });
  }

}
