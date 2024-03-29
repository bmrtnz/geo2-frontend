import { Injectable } from "@angular/core";
import { gql, MutationOptions, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DeclarationFraude from "app/shared/models/declaration-fraude.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import notify from "devextreme/ui/notify";
import { from, iif, of, throwError } from "rxjs";
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  mergeMap,
  take,
  takeUntil
} from "rxjs/operators";
import { Ordre, Statut, StatutLocale } from "../../models/ordre.model";
import {
  APICount,
  APIPersist,
  APIRead,
  ApiService,
  RelayPage
} from "../api.service";
import { LocalizationService } from "../localization.service";
import { DevisesRefsService } from "./devises-refs.service";
import {
  functionBody,
  FunctionResponse,
  FunctionResult,
  FunctionsService
} from "./functions.service";

export enum Operation {
  All = "allOrdre",
  BAF = "allOrdreBAF",
  SuiviDeparts = "allOrdreSuiviDeparts",
  PlanningTransporteursApproche = "allOrdrePlanningTransporteursApproche",
  PlanningFournisseurs = "allOrdrePlanningFournisseurs",
  SupervisionComptesPalox = "allOrdreSupervisionComptesPalox",
  NonConfirmes = "allOrdreNonConfirmes",
}

export type CountResponse = { countOrdre: number };

@Injectable({
  providedIn: "root",
})
export class OrdresService
  extends ApiService
  implements APIRead, APIPersist, APICount<CountResponse>
{
  constructor(
    apollo: Apollo,
    public functionsService: FunctionsService,
    private devisesRefsService: DevisesRefsService,
    private localize: LocalizationService,
  ) {
    super(apollo, Ordre);
  }

  /* eslint-disable-next-line */
  queryFilter =
    /.*(?:id|numero|codeChargement|numeroFacture|marge|codeClient|codeAlphaEntrepot|sommeColisCommandes|sommeColisExpedies|totalNombrePalettesCommandees|referenceClient|nomUtilisateur|raisonSocial|dateLivraisonPrevue|statut|versionDetail|dateDepartPrevue|bonAFacturer|pourcentageMargeBrut|transporteurDEVPrixUnitaire|prixUnitaireTarifTransport|transporteurDEVCode)$/i;

  public persistantVariables: Record<string, any> = { onlyColisDiff: false };
  public orderTabItems = [];

  setPersisantVariables(params = this.persistantVariables) {
    this.persistantVariables = params;
  }

  getOne(id: string) {
    type Response = { ordre: Ordre };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>, fetchPol?) {
    return this.apollo.query<{ ordre: Ordre }>({
      query: gql(this.buildGetOneGraph(columns)),
      variables: { id },
      fetchPolicy: fetchPol ?? "cache-first",
    });
  }

  getOneByNumeroAndSocieteAndCampagne(
    numero: string,
    societe: string,
    campagne: string,
    body: string[],
    fetchPol?: any
  ) {
    return this.apollo.query<{ ordreByNumeroAndSocieteAndCampagne: Ordre }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "ordreByNumeroAndSocieteAndCampagne",
              body,
              params: [
                { name: "numero", value: "numero", isVariable: true },
                { name: "societe", value: "societe", isVariable: true },
                { name: "campagne", value: "campagne", isVariable: true },
              ],
            },
          ],
          [
            { name: "numero", type: "String", isOptionnal: false },
            { name: "societe", type: "String", isOptionnal: false },
            { name: "campagne", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: { numero, societe, campagne },
      fetchPolicy: fetchPol ? fetchPol : "cache-first",
    });
  }

  getDataSource(indicator?: Operation, depth = 2, qFilter = this.queryFilter) {
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

            let query: string;
            if (indicator === Operation.SuiviDeparts)
              query = await this.buildGetAllSuiviDeparts(
                depth,
                qFilter,
                indicator
              );
            else query = await this.buildGetAll(depth, qFilter, indicator);

            const key: string = indicator ?? "allOrdre";
            type Response = { [key: string]: RelayPage<Ordre> };
            const variables = {
              ...this.persistantVariables,
              ...this.mapLoadOptionsToVariables(options),
            };

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data[key])
                resolve(this.asInstancedListCount(res.data[key]));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { ordre: Ordre };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.ordre)
                resolve(new Ordre(res.data.ordre));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordre: Ordre };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ordre) resolve(new Ordre(res.data.ordre));
        });
      });
  }

  getDataSource_v2(columns: Array<string>, indicator = Operation.All) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll_v2(columns, indicator);
            type Response = { [indicator: string]: RelayPage<Ordre> };

            const variables = {
              ...this.persistantVariables,
              ...this.mapLoadOptionsToVariables(options),
            };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data[indicator]) {
                resolve(this.asInstancedListCount(res.data[indicator]));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  // getSuiviDepartsDatasource(body: Array<string> | Set<string>) {
  //   return new DataSource({
  //     store: this.createCustomStore({
  //       // byKey: this.byKey([...body]),
  //       load: options => this.apollo
  //         .query<{ allOrdreLigneSuiviDeparts: RelayPage<OrdreLigne> }>({
  //           query: gql(ApiService.buildGraph(
  //             "query",
  //             [
  //               {
  //                 name: "allOrdreLigneSuiviDeparts",
  //                 body: [
  //                   "pageInfo.startCursor",
  //                   "pageInfo.endCursor",
  //                   "pageInfo.hasPreviousPage",
  //                   "pageInfo.hasNextPage",
  //                   "totalCount",
  //                   ...[...body].map(c => `edges.node.${c}`),
  //                 ],
  //                 params: [
  //                   { name: "search", value: "search", isVariable: true },
  //                   { name: "pageable", value: "pageable", isVariable: true },
  //                   { name: "onlyColisDiff", value: "onlyColisDiff", isVariable: true },
  //                 ],
  //               },
  //             ],
  //             [
  //               { name: "search", type: "String", isOptionnal: true },
  //               { name: "pageable", type: "PaginationInput", isOptionnal: false },
  //               { name: "onlyColisDiff", type: "Boolean", isOptionnal: false },
  //             ],
  //           )),
  //           variables: {
  //             ...this.persistantVariables,
  //             ...this.mapLoadOptionsToVariables(options)
  //           },
  //         })
  //         .pipe(
  //           map(res => this.asInstancedListCount(res.data.allOrdreLigneSuiviDeparts, e => new OrdreLigne(e))),
  //         )
  //         .toPromise(),
  //     }),
  //   });
  // }

  save(variables: OperationVariables & { ordre: Partial<Ordre> }) {
    return this.watchSaveQuery({ variables }, 1, this.queryFilter);
  }

  delete(variables: OperationVariables) {
    return this.watchDeleteQuery({ variables });
  }

  clone(variables: OperationVariables) {
    return from(this.buildSaveWithClone(1, this.queryFilter)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          fetchPolicy: "no-cache",
          variables,
        } as MutationOptions)
      ),
      take(1)
    );
  }

  protected async buildSaveWithClone(depth?: number, fieldsFilter?: RegExp) {
    return `
      mutation CloneOrdre($ordre: GeoOrdreInput!) {
        cloneOrdre(ordre: $ordre) {
          ${await this.model.getGQLFields(depth, fieldsFilter).toPromise()}
        }
      }
    `;
  }

  protected async buildGetOrdreByNumeroAndSociete(
    depth?: number,
    fieldsFilter?: RegExp
  ) {
    return `
      query OrdreByNumeroAndSociete($numero: String!, $societe: String!) {
        ordreByNumeroAndSociete(numero:$numero, societe:$societe) {
          ${await this.model
        .getGQLFields(depth, fieldsFilter, null, { noList: true })
        .toPromise()}
        }
      }
    `;
  }

  protected async buildGetAllSuiviDeparts(
    depth?: number,
    regExpFilter?: RegExp,
    operationName?: string
  ) {
    const operation = operationName ?? `all${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String, $pageable: PaginationInput!, $onlyColisDiff: Boolean) {
        ${operation}(search:$search, pageable:$pageable, onlyColisDiff:$onlyColisDiff) {
          edges {
            node {
              ${await this.model
        .getGQLFields(depth, regExpFilter, null, { noList: true })
        .toPromise()}
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          totalCount
        }
      }
    `;
  }

  count(dxFilter?: any[]) {
    const search = this.mapDXFilterToRSQL(dxFilter);
    return this.watchCountQuery<CountResponse>(search).pipe(first());
  }

  saveAll(variables: OperationVariables & { allOrdre: Ordre[] }) {
    return this.watchSaveAllQuery({ variables }, 1, this.queryFilter);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveOrdre: Ordre }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }

  async isCloture(ordre: Partial<Ordre>) {
    if (!ordre?.statut) {
      const chunk = await this.getOne_v2(ordre.id, ["statut"])
        .pipe(map((res) => res.data.ordre))
        .toPromise();
      ordre.statut = chunk.statut;
    }
    return Ordre.isCloture(ordre);
  }

  /**
   * Comptabilisation des retraits
   */
  public fChgtQteArtRet(ordreRef: string) {
    return this.functionsService.queryFunction("fChgtQteArtRet", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  /**
   * Suppression d'un ordre
   */
  public fSuppressionOrdre(
    ordreRef: string,
    commentaire: string,
    username: string
  ) {
    return this.functionsService.queryFunction("fSuppressionOrdre", [
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "commentaire", type: "String", value: commentaire },
      { name: "username", type: "String", value: username },
    ]);
  }

  /**
   * Test annulation d'un ordre
   */
  public fTestAnnuleOrdre(ordreRef: string) {
    return this.functionsService.queryFunction("fTestAnnuleOrdre", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }

  /**
   * Annulation d'un ordre
   */
  public fAnnulationOrdre = (motif: string, ordreRef: string) =>
    this.apollo.query<{ fAnnulationOrdre: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "fAnnulationOrdre",
              body: functionBody,
              params: [
                { name: "motif", value: "motif", isVariable: true },
                { name: "ordreRef", value: "ordreRef", isVariable: true },
              ],
            },
          ],
          [
            { name: "motif", type: "String", isOptionnal: false },
            { name: "ordreRef", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: { motif, ordreRef },
      fetchPolicy: "network-only",
    });

  /**
   * Création d'un ordre complémentaire
   */
  public fCreeOrdreComplementaire(
    ordreRef: string,
    socCode: string,
    username: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreComplementaire", [
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "socCode", type: "String", value: socCode },
      { name: "username", type: "String", value: username },
    ]);
  }

  /**
   * Création d'un ordre de régularisation
   */
  public fCreeOrdreRegularisation(
    indDetail: boolean,
    lcaCode: string,
    listOrlRef: string[],
    typeReg: string,
    ordreRef: string,
    socCode: string,
    username: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreRegularisation", [
      { name: "indDetail", type: "Boolean", value: indDetail },
      { name: "lcaCode", type: "String", value: lcaCode },
      { name: "listOrlRef", type: "[String]", value: listOrlRef },
      { name: "typeReg", type: "String", value: typeReg },
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "socCode", type: "String", value: socCode },
      { name: "username", type: "String", value: username },
    ]);
  }

  /**
   * of_sauve_ordre
   */
  public ofSauveOrdre(ordRef: string) {
    return this.functionsService.queryFunction("ofSauveOrdre", [
      { name: "ordRef", type: "String", value: ordRef },
    ]);
  }

  /**
   * Duplication d'un ordre
   */
  public wDupliqueOrdreOnDuplique(
    depDate: string,
    livDate: string,
    cenRef: string,
    withCodeChargement: boolean,
    withFourni: boolean,
    withAchPu: boolean,
    withVtePu: boolean,
    withLibDlv: boolean,
    withEtdDate: boolean,
    withEtaDate: boolean,
    withEtdLocation: boolean,
    withEtaLocation: boolean,
    withIncCode: boolean,
    ordRef: string,
    socCode: string,
    user: string
  ) {
    return this.functionsService.queryFunction("wDupliqueOrdreOnDuplique", [
      { name: "depDate", type: "LocalDateTime", value: depDate },
      { name: "livDate", type: "LocalDate", value: livDate },
      { name: "cenRef", type: "String", value: cenRef },
      {
        name: "withCodeChargement",
        type: "Boolean",
        value: withCodeChargement,
      },
      { name: "withFourni", type: "Boolean", value: withFourni },
      { name: "withAchPu", type: "Boolean", value: withAchPu },
      { name: "withVtePu", type: "Boolean", value: withVtePu },
      { name: "withLibDlv", type: "Boolean", value: withLibDlv },
      { name: "withEtdDate", type: "Boolean", value: withEtdDate },
      { name: "withEtaDate", type: "Boolean", value: withEtaDate },
      { name: "withEtdLocation", type: "Boolean", value: withEtdLocation },
      { name: "withEtaLocation", type: "Boolean", value: withEtaLocation },
      { name: "withIncCode", type: "Boolean", value: withIncCode },
      { name: "ordRef", type: "String", value: ordRef },
      { name: "socCode", type: "String", value: socCode },
      { name: "user", type: "String", value: user },
    ]);
  }

  public fEnvoiBLAuto(
    socCode: string,
    scoCode: string,
    dateMin: string,
    dateMax: string,
    nomUtilisateur: string
  ) {
    return this.apollo
      .query<{
        fEnvoiBLAuto: FunctionResponse<{ array_ord_ref: Array<string> }>;
      }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name: "fEnvoiBLAuto",
                body: functionBody,
                params: [
                  { name: "socCode", value: "socCode", isVariable: true },
                  { name: "scoCode", value: "scoCode", isVariable: true },
                  { name: "dateMin", value: "dateMin", isVariable: true },
                  { name: "dateMax", value: "dateMax", isVariable: true },
                  {
                    name: "nomUtilisateur",
                    value: "nomUtilisateur",
                    isVariable: true,
                  },
                ],
              },
            ],
            [
              { name: "socCode", type: "String", isOptionnal: false },
              { name: "scoCode", type: "String", isOptionnal: false },
              { name: "dateMin", type: "LocalDate", isOptionnal: false },
              { name: "dateMax", type: "LocalDate", isOptionnal: false },
              { name: "nomUtilisateur", type: "String", isOptionnal: false },
            ]
          )
        ),
        variables: { socCode, scoCode, dateMin, dateMax, nomUtilisateur },
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => res.data.fEnvoiBLAuto));
  }

  public fnMajOrdreRegroupementV2(
    ordreRef: string,
    socCode: string,
    entrepotGeneric: boolean,
    nomUtilisateur: string
  ) {
    return this.functionsService.queryFunction("fnMajOrdreRegroupementV2", [
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "socCode", type: "String", value: socCode },
      { name: "entrepotGeneric", type: "Boolean", value: entrepotGeneric },
      { name: "nomUtilisateur", type: "String", value: nomUtilisateur },
    ]);
  }
  public fCreeOrdreReplacement(
    ordreOriginID: string,
    entrepotID: string,
    societeID: string,
    nomUtilisateur: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreReplacement", [
      { name: "ordreOriginID", type: "String", value: ordreOriginID },
      { name: "entrepotID", type: "String", value: entrepotID },
      { name: "societeID", type: "String", value: societeID },
      { name: "nomUtilisateur", type: "String", value: nomUtilisateur },
    ]);
  }

  public fCreeOrdreReedFact(
    ordreOriginID: string,
    societeID: string,
    nomUtilisateur: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreReedFact", [
      { name: "ordreOriginID", type: "String", value: ordreOriginID },
      { name: "societeID", type: "String", value: societeID },
      { name: "nomUtilisateur", type: String, value: nomUtilisateur },
    ]);
  }

  /**
  * retourne les infos forfait transport
  */

  public fReturnForfaitsTrp(
    typeOrd: string,
    cenRef: string,
    incCode: string
  ) {
    return this.functionsService.queryFunction("fReturnForfaitsTrp", [
      { name: "typeOrd", type: "String", value: typeOrd },
      { name: "cenRef", type: "String", value: cenRef },
      { name: "incCode", type: "String", value: incCode }
    ]);
  }

  public fDuplicationBukSa(
    ordreRef: string,
    socCode: string,
    nomUtilisateur: string,
    codeRegimeTva: string
  ) {
    return this.functionsService.queryFunction("fDuplicationBukSa", [
      { name: "ordreRef", type: "String", value: ordreRef },
      { name: "socCode", type: "String", value: socCode },
      { name: "nomUtilisateur", type: "String", value: nomUtilisateur },
      { name: "codeRegimeTva", type: "String", value: codeRegimeTva },
    ]);
  }

  public fDelRegroupement(ordreRef: string) {
    return this.functionsService.queryFunction("fDelRegroupement", [
      { name: "ordreRef", type: "String", value: ordreRef },
    ]);
  }
  public fCreeOrdreReedFactLigne(
    ordreID: string,
    ordreOriginID: string,
    societeID: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdreReedFact", [
      { name: "ordreID", type: "String", value: ordreID },
      { name: "ordreOriginID", type: "String", value: ordreOriginID },
      { name: "societeID", type: "String", value: societeID },
    ]);
  }

  public updateTransporteurPU(ordreChunk: Partial<Ordre>) {
    return this.functionsService
      .fReturnForfaitsTrp(
        ordreChunk.entrepot?.id,
        ordreChunk.incoterm?.id,
        ordreChunk.type?.id
      )
      .pipe(
        // Pas de forfaits, on s'arrete la
        filter((res) => res.data.fReturnForfaitsTrp.res === FunctionResult.OK),
        map((res) => ({
          forfaitsTrp: res.data.fReturnForfaitsTrp.data.li_ret,
          // default?
          trpDevPu: res.data.fReturnForfaitsTrp.data.arg_trp_dev_pu,
          btaCode: res.data.fReturnForfaitsTrp.data.arg_bta_code,
          devCode: res.data.fReturnForfaitsTrp.data.arg_dev_code,
        })),
        // continue if we have `forfaitsTrp` value
        concatMap((context) =>
          iif(
            () => context.forfaitsTrp > 0,
            // merge context with associated `deviseRef.taux`
            this.devisesRefsService
              .getList(
                `devise.id==${ordreChunk.transporteurDEVCode.id} and id==${context.devCode}`,
                ["id", "devise.id", "taux"]
              )
              .pipe(
                concatMap((res) =>
                  !res.data.allDeviseRefList?.[0].taux
                    ? throwError(
                      new Error("Le taux de cette devise n'est pas renseigné")
                    )
                    : of({
                      transporteurDEVPrixUnitaire:
                        context.trpDevPu /
                        res.data.allDeviseRefList?.[0].taux,
                      prixUnitaireTarifTransport: context.trpDevPu,
                      transporteurDEVCode: {
                        id:
                          res.data.allDeviseRefList?.[0].devise.id ??
                          context.devCode,
                      },
                      baseTarifTransport: { id: context.btaCode },
                    })
                ),
                catchError((err, catched) => {
                  notify(err.message, "warning");
                  return of({
                    transporteurDEVPrixUnitaire: context.trpDevPu,
                    transporteurDEVCode: { id: context.devCode },
                    baseTarifTransport: { id: context.btaCode },
                  });
                })
              ),
            of({})
          )
        ),
        // merge input data
        concatMap((data) =>
          this.save_v2(
            [
              "transporteurDEVPrixUnitaire",
              "transporteurDEVCode.id",
              "baseTarifTransport.id",
            ],
            { ordre: { id: ordreChunk.id, ...data } }
          )
        ),
        map(
          (res) => ({ ...ordreChunk, ...res.data.saveOrdre } as Partial<Ordre>)
        )
      );
  }

  public allDeclarationFraude(
    body: Set<string>,
    secteur: string,
    societe: string,
    dateMin: string,
    dateMax: string,
    dateCreation: string,
    client: string,
    transporteur: string,
    fournisseur: string,
    bureauAchat: string,
    entrepot: string
  ) {
    return this.apollo
      .query<{ allDeclarationFraude: Array<Partial<DeclarationFraude>> }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name: "allDeclarationFraude",
                body,
                params: [
                  { name: "secteur", value: "secteur", isVariable: true },
                  { name: "societe", value: "societe", isVariable: true },
                  { name: "dateMin", value: "dateMin", isVariable: true },
                  { name: "dateMax", value: "dateMax", isVariable: true },
                  {
                    name: "dateCreation",
                    value: "dateCreation",
                    isVariable: true,
                  },
                  { name: "client", value: "client", isVariable: true },
                  {
                    name: "transporteur",
                    value: "transporteur",
                    isVariable: true,
                  },
                  {
                    name: "fournisseur",
                    value: "fournisseur",
                    isVariable: true,
                  },
                  {
                    name: "bureauAchat",
                    value: "bureauAchat",
                    isVariable: true,
                  },
                  { name: "entrepot", value: "entrepot", isVariable: true },
                ],
              },
            ],
            [
              { name: "secteur", type: "String", isOptionnal: false },
              { name: "societe", type: "String", isOptionnal: false },
              { name: "dateMin", type: "LocalDate", isOptionnal: false },
              { name: "dateMax", type: "LocalDate", isOptionnal: false },
              {
                name: "dateCreation",
                type: "LocalDateTime",
                isOptionnal: true,
              },
              { name: "client", type: "String", isOptionnal: true },
              { name: "transporteur", type: "String", isOptionnal: true },
              { name: "fournisseur", type: "String", isOptionnal: true },
              { name: "bureauAchat", type: "String", isOptionnal: true },
              { name: "entrepot", type: "String", isOptionnal: true },
            ]
          )
        ),
        variables: {
          secteur,
          societe,
          dateMin,
          dateMax,
          dateCreation,
          client,
          transporteur,
          fournisseur,
          bureauAchat,
          entrepot,
        },
        fetchPolicy: "network-only",
      })
      .pipe(map((res) => res.data.allDeclarationFraude));
  }

  public getStatutsSource() {
    return Object
      .entries(Statut)
      .map(([key, value]) => ({
        text: this.localize.localize(StatutLocale[key])?.ucFirst(),
        value,
      }))
  }

  public buildAllOrdreNonConfirmes(columns: Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `allOrdreNonConfirmes`,
          body: [
            "pageInfo.startCursor",
            "pageInfo.endCursor",
            "pageInfo.hasPreviousPage",
            "pageInfo.hasNextPage",
            "totalCount",
            ...[...columns].map((c) => `edges.node.${c}`),
          ],
          params: [
            { name: "search", value: "search", isVariable: true },
            { name: "pageable", value: "pageable", isVariable: true },
          ],
        },
      ],
      [
        { name: "search", type: "String", isOptionnal: true },
        { name: "pageable", type: "PaginationInput", isOptionnal: false },
      ]
    );
  }
}
