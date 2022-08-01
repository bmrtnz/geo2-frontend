import { Injectable } from "@angular/core";
import { gql, MutationOptions, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { from } from "rxjs";
import { first, map, mergeMap, take, takeUntil } from "rxjs/operators";
import { Ordre } from "../../models/ordre.model";
import { APICount, APIPersist, APIRead, ApiService, RelayPage } from "../api.service";
import { functionBody, FunctionResponse } from "./functions.service";

export enum Operation {
  All = "allOrdre",
  BAF = "allOrdreBAF",
  SuiviDeparts = "allOrdreSuiviDeparts",
  PlanningTransporteursApproche = "allOrdrePlanningTransporteursApproche",
  PlanningFournisseurs = "allOrdrePlanningFournisseurs",
  SupervisionComptesPalox = "allOrdreSupervisionComptesPalox"
}

export type CountResponse = { countOrdre: number };

@Injectable({
  providedIn: "root"
})
export class OrdresService extends ApiService implements APIRead, APIPersist, APICount<CountResponse> {

  /* tslint:disable-next-line */
  queryFilter = /.*(?:id|numero|numeroFacture|marge|referenceClient|nomUtilisateur|raisonSocial|dateLivraisonPrevue|statut|dateDepartPrevue|bonAFacturer|pourcentageMargeBrut)$/i;

  public persistantVariables: Record<string, any> = { onlyColisDiff: false };

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Ordre);
  }

  setPersisantVariables(params = this.persistantVariables) {
    this.persistantVariables = params;
  }

  getOne(id: string) {
    type Response = { ordre: Ordre };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getOne_v2(id: string, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ ordre: Ordre }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      });
  }

  getOneByNumeroAndSocieteAndCampagne(
    numero: string,
    societe: string,
    campagne: string,
    body: string[],
  ) {
    return this.apollo
      .query<{ ordreByNumeroAndSocieteAndCampagne: Ordre }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ordreByNumeroAndSocieteAndCampagne",
              body,
              params: [
                { name: "numero", value: "numero", isVariable: true },
                { name: "societe", value: "societe", isVariable: true },
                { name: "campagne", value: "campagne", isVariable: true },
              ]
            }
          ],
          [
            { name: "numero", type: "String", isOptionnal: false },
            { name: "societe", type: "String", isOptionnal: false },
            { name: "campagne", type: "String", isOptionnal: false },
          ],
        )),
        variables: { numero, societe, campagne },
        fetchPolicy: "cache-first",
      });
  }

  getDataSource(indicator?: Operation, depth = 2, qFilter = this.queryFilter) {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          let query: string;
          if (indicator === Operation.SuiviDeparts)
            query = await this.buildGetAllSuiviDeparts(depth, qFilter, indicator);
          else
            query = await this.buildGetAll(depth, qFilter, indicator);

          const key: string = indicator ?? "allOrdre";
          type Response = { [key: string]: RelayPage<Ordre> };
          const variables = {
            ...this.persistantVariables,
            ...this.mapLoadOptionsToVariables(options)
          };

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data[key])
              resolve(this.asInstancedListCount(res.data[key]));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { ordre: Ordre };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
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
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.ordre)
            resolve(new Ordre(res.data.ordre));
        });
      });
  }

  getDataSource_v2(columns: Array<string>, indicator = Operation.All) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll_v2(columns, indicator);
          type Response = { [indicator: string]: RelayPage<Ordre> };

          const variables = {
            ...this.persistantVariables,
            ...this.mapLoadOptionsToVariables(options)
          };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data[indicator]) {
              resolve(this.asInstancedListCount(res.data[indicator]));
            }
          });
        }),
        byKey: this.byKey(columns),
      }),
    });
  }

  save(variables: OperationVariables & { ordre: Partial<Ordre> }) {
    return this.watchSaveQuery({ variables }, 1, this.queryFilter);
  }

  delete(variables: OperationVariables) {
    return this.watchDeleteQuery({ variables });
  }

  clone(variables: OperationVariables) {
    return from(this.buildSaveWithClone(1, this.queryFilter))
      .pipe(
        takeUntil(this.destroy),
        mergeMap(query => this.apollo.mutate({
          mutation: gql(query),
          fetchPolicy: "no-cache",
          variables,
        } as MutationOptions)),
        take(1),
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

  protected async buildGetOrdreByNumeroAndSociete(depth?: number, fieldsFilter?: RegExp) {
    return `
      query OrdreByNumeroAndSociete($numero: String!, $societe: String!) {
        ordreByNumeroAndSociete(numero:$numero, societe:$societe) {
          ${await this.model.getGQLFields(depth, fieldsFilter, null, { noList: true }).toPromise()}
        }
      }
    `;
  }

  protected async buildGetAllSuiviDeparts(depth?: number, regExpFilter?: RegExp, operationName?: string) {
    const operation = operationName ?? `all${this.model.name}`;
    const alias = operation.ucFirst();
    return `
      query ${alias}($search: String, $pageable: PaginationInput!, $onlyColisDiff: Boolean) {
        ${operation}(search:$search, pageable:$pageable, onlyColisDiff:$onlyColisDiff) {
          edges {
            node {
              ${await this.model.getGQLFields(depth, regExpFilter, null, { noList: true }).toPromise()}
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
      const chunk = await this
        .getOne_v2(ordre.id, ["statut"])
        .pipe(map(res => res.data.ordre))
        .toPromise();
      ordre.statut = chunk.statut;
    }
    return Ordre.isCloture(ordre);
  }

  /**
   * Mise en Bon à facturer - f_bon_a_facturer
   */
  public fBonAFacturer =
    (ordreRef: string, socCode: string) => this.apollo
      .query<{ fBonAFacturer: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fBonAFacturer",
              body: functionBody,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "socCode", value: "socCode", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "socCode", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreRef, socCode },
        fetchPolicy: "network-only",
      })

}
