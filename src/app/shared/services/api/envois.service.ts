import { Injectable } from "@angular/core";
import { ApolloQueryResult } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { Flux } from "app/shared/models";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { concatMap, map, take } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { FunctionResponse, FunctionsService } from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class EnvoisService extends ApiService implements APIRead {
  // listRegexp = /.*\.(?:id|libelle)$/i;

  constructor(private functionsService: FunctionsService, apollo: Apollo) {
    super(apollo, Envois);
  }

  getDataSource() {
    return new DataSource({
      // sort: [
      //   { selector: this.model.getLabelField() as string }
      // ],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            // const query = await this.buildGetAll(1, this.listRegexp);
            const query = await this.buildGetAll(1);
            type Response = { allEnvois: RelayPage<Envois> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "no-cache" },
              (res) => {
                if (res.data && res.data.allEnvois)
                  resolve(this.asInstancedListCount(res.data.allEnvois));
              }
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            // const query = await this.buildGetOne(1, this.listRegexp);
            const query = await this.buildGetOne(1);
            type Response = { envois: Envois };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.envois)
                resolve(new Envois(res.data.envois));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { envois: Envois };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.envois) resolve(new Envois(res.data.envois));
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

            type Response = { allEnvois: RelayPage<Envois> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "no-cache" },
              (res) => {
                if (res.data && res.data.allEnvois) {
                  resolve(this.asInstancedListCount(res.data.allEnvois));
                }
              }
            );
          }),
        byKey: this.byKey(columns),
        update: (key, values) => {
          const variables = { ordreLigne: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
      }),
    });
  }

  getList(search: string, columns: Array<string>) {
    return this.apollo.query<{ allEnvoisList: Envois[] }>({
      query: gql(this.buildGetListGraph(columns)),
      variables: { search },
      fetchPolicy: "network-only",
    });
  }

  saveAll(allEnvois: Partial<Envois>[], columns: Set<string>) {
    return this.apollo
      .mutate({
        mutation: gql(this.buildSaveAllGraph([...columns])),
        variables: { allEnvois },
      })
      .pipe(take(1));
  }

  buildDuplicateMergeAllGraph(body: Array<string>) {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: `duplicateMergeAll${this.model.name}`,
          body,
          params: [
            {
              name: `all${this.model.name}`,
              value: `all${this.model.name}`,
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: `all${this.model.name}`,
          type: `[Geo${this.model.name}Input]`,
          isOptionnal: false,
        },
      ]
    );
  }

  duplicateMergeAllEnvois(allEnvois: Partial<Envois>[], columns: Set<string>) {
    return this.apollo
      .mutate({
        mutation: gql(this.buildDuplicateMergeAllGraph([...columns])),
        variables: { allEnvois },
      })
      .pipe(take(1));
  }

  public countBy(search: string) {
    return this.apollo.query<{ countBy: number }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "countBy",
              params: [{ name: "search", value: "search", isVariable: true }],
            },
          ],
          [{ name: "search", type: "String", isOptionnal: true }]
        )
      ),
      variables: { search },
      fetchPolicy: "network-only",
    });
  }

  /** Count envois that are not temporary */
  public countReals(ordreID: Ordre["id"], ...fluxsID: Array<Flux["id"]>) {
    const fluxs = fluxsID
      .map(id => `flux.id==${id}`)
      .join(' or ');
    return this.countBy(
      `ordre.id==${ordreID} and (${fluxs}) and (traite==N or traite==O or traite=isnull=null)`
    ).pipe(
      map(res => res.data.countBy),
    )
  }

  public countByOrdreAndFlux(
    ordre: { id: string } & Partial<Ordre>,
    flux: { id: string } & Partial<Flux>
  ) {
    return this.apollo.query<{ countByOrdreAndFlux: number }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "countByOrdreAndFlux",
              params: [
                { name: "ordre", value: "ordre", isVariable: true },
                { name: "flux", value: "flux", isVariable: true },
              ],
            },
          ],
          [
            { name: "ordre", type: "GeoOrdreInput", isOptionnal: false },
            { name: "flux", type: "GeoFluxInput", isOptionnal: false },
          ]
        )
      ),
      variables: { ordre, flux },
      fetchPolicy: "network-only",
    });
  }

  public countByOrdreFluxTraite(
    ordre: { id: string } & Partial<Ordre>,
    flux: { id: string } & Partial<Flux>,
    traite: Set<string>
  ) {
    return this.apollo.query<{ countByOrdreFluxTraite: number }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "countByOrdreFluxTraite",
              params: [
                { name: "ordre", value: "ordre", isVariable: true },
                { name: "flux", value: "flux", isVariable: true },
                { name: "traite", value: "traite", isVariable: true },
              ],
            },
          ],
          [
            { name: "ordre", type: "GeoOrdreInput", isOptionnal: false },
            { name: "flux", type: "GeoFluxInput", isOptionnal: false },
            { name: "traite", type: "[Char]", isOptionnal: false },
          ]
        )
      ),
      variables: { ordre, flux, traite: [...traite] },
      fetchPolicy: "network-only",
    });
  }

  public fConfirmationCommande(
    ordreRef: string,
    societeCode: string,
    username: string
  ) {
    return this.functionsService.queryFunction("fConfirmationCommande", [
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "societeCode", type: "String", value: societeCode },
      { name: "username", type: "String", value: username },
    ]);
  }

  public fDocumentEnvoiDetailsExp(ordreRef: string, societeCode: string) {
    return this.functionsService
      .queryFunction("fDocumentEnvoiDetailsExp", [
        { name: "ordreRef", type: "String", value: ordreRef },
        { name: "societeCode", type: "String", value: societeCode },
      ])
      .pipe(
        map((res) => {
          const clone = JSON.parse(JSON.stringify(res));
          clone.data.fDocumentEnvoiDetailsExp.data.ordreRef = ordreRef;
          return clone as ApolloQueryResult<{
            [name: string]: FunctionResponse;
          }>;
        })
      );
  }

  public fDocumentEnvoiConfirmationPrixAchat(ordreRef: string) {
    return this.functionsService.queryFunction(
      "fDocumentEnvoiConfirmationPrixAchat",
      [{ name: "ordreRef", type: "String", value: ordreRef }]
    );
  }

  public fDocumentEnvoiFichesPalette(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiFichesPalette", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiGenereTraca(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiGenereTraca", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiBonLivraison(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiBonLivraison", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiProforma(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiProforma", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiCominv(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiCominv", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiShipmentBuyco(ordreRef: string) {
    return this.functionsService.queryFunction("fDocumentEnvoiShipmentBuyco", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  public fDocumentEnvoiFactureDouaniere(ordreRef: string) {
    return this.functionsService.queryFunction(
      "fDocumentEnvoiFactureDouaniere",
      [{ name: "ordreRef", type: "String", value: ordreRef }]
    );
  }

  public deleteTempEnvois(allEnvois: Array<Partial<Envois>>) {
    return this.apollo.mutate({
      mutation: gql(
        ApiService.buildGraph(
          "mutation",
          [
            {
              name: "deleteTempEnvois",
              params: [
                { name: "allEnvois", value: "allEnvois", isVariable: true },
              ],
            },
          ],
          [{ name: "allEnvois", type: "[GeoEnvoisInput]", isOptionnal: true }]
        )
      ),
      variables: { allEnvois },
    });
  }

  /** Clear envois entities with a "temporary" state */
  clearTemps(ordreID: Ordre["id"]) {
    return this.getList(
      `ordre.id==${ordreID} and traite==A`,
      ["id"]).pipe(
        map(res => res.data.allEnvoisList.map(({ id }) => ({ id }))),
        concatMap(res => this.deleteTempEnvois(res)),
      );
  }
}
