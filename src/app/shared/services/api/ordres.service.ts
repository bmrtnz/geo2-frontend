import { Injectable } from '@angular/core';
import { ApolloQueryResult, gql, MutationOptions, OperationVariables, WatchQueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from, Subject } from 'rxjs';
import { filter, first, map, mergeMap, take, takeUntil } from 'rxjs/operators';
import { Ordre } from '../../models/ordre.model';
import { APICount, APIPersist, APIRead, ApiService, RelayPage } from '../api.service';

export enum Operation {
  All = 'allOrdre',
  BAF = 'allOrdreBAF',
  SuiviDeparts = 'allOrdreSuiviDeparts',
  PlanningTransporteursApproche = 'allOrdrePlanningTransporteursApproche',
  PlanningFournisseurs = 'allOrdrePlanningFournisseurs',
  SupervisionComptesPalox = 'allOrdreSupervisionComptesPalox'
}

export type CountResponse = { countOrdre: number };

@Injectable({
  providedIn: 'root'
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
    return this.watchGetOneQuery<Response>({variables});
  }

  getOneByNumeroAndSociete(
    numero: string,
    societe: string,
    depth = 2,
    fieldsFilter?: RegExp
  ) {
    type Response = { ordreByNumeroAndSociete: Ordre };
    const variables: OperationVariables = { numero, societe };

    const done = new Subject<ApolloQueryResult<Response>>();
    from(this.buildGetOrdreByNumeroAndSociete(depth, fieldsFilter))
    .pipe(
      takeUntil(this.destroy),
      takeUntil(done),
      mergeMap( query => this.query<Response>(query, {
        fetchPolicy: 'cache-and-network',
        variables,
      } as WatchQueryOptions)),
      filter( res => !!Object.keys(res.data).length),
    )
    .subscribe(res => {
      done.next(res);
      if (!res.loading)
        done.complete();
    });
    return done.pipe(map( res => res.data.ordreByNumeroAndSociete));
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

          const key: string = indicator ?? 'allOrdre';
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

  save(variables: OperationVariables & {ordre: Partial<Ordre>}) {
    return this.watchSaveQuery({ variables }, 1, this.queryFilter);
  }

  delete(variables: OperationVariables) {
    return this.watchDeleteQuery({ variables });
  }

  clone(variables: OperationVariables) {
    return from(this.buildSaveWithClone(1, this.queryFilter))
    .pipe(
      takeUntil(this.destroy),
      mergeMap( query => this.apollo.mutate({
        mutation: gql(query),
        fetchPolicy: 'no-cache',
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
          ${await this.model.getGQLFields(depth, fieldsFilter).toPromise()}
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
              ${await this.model.getGQLFields(depth, regExpFilter, null, {noList: true}).toPromise()}
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

  saveAll(variables: OperationVariables & {allOrdre: Ordre[]}) {
    return this.watchSaveAllQuery({ variables }, 1, this.queryFilter);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveOrdre: Ordre }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }

}
