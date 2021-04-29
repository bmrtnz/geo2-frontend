import { Injectable } from '@angular/core';
import { gql, MutationOptions, OperationVariables, WatchQueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from } from 'rxjs';
import { mergeMap, take, takeUntil } from 'rxjs/operators';
import { Ordre } from '../../models/ordre.model';
import { APIPersist, APIRead, ApiService, RelayPage } from '../api.service';

export enum OrdreDatasourceOperation {
  BAF = 'allOrdreBAF',
}

@Injectable({
  providedIn: 'root'
})
export class OrdresService extends ApiService implements APIRead, APIPersist {

  /* tslint:disable-next-line */
  queryFilter = /.*(?:id|numero|numeroFacture|marge|referenceClient|nomUtilisateur|raisonSocial|dateLivraisonPrevue|dateDepartPrevue|bonAFacturer)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Ordre);
  }

  getOne(id: string) {
    type Response = { ordre: Ordre };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({variables});
  }

  getDataSource(indicator?: OrdreDatasourceOperation) {
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

          const query = await this.buildGetAll(2, this.queryFilter, indicator);
          const key: string = indicator ?? 'allOrdre';
          type Response = { [key: string]: RelayPage<Ordre> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables, fetchPolicy: 'no-cache' }, res => {
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

  save(variables: OperationVariables & {ordre: Ordre}) {
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

  protected async buildSaveWithClone(depth?: number, filter?: RegExp) {
    return `
      mutation CloneOrdre($ordre: GeoOrdreInput!) {
        cloneOrdre(ordre: $ordre) {
          ${await this.model.getGQLFields(depth, filter).toPromise()}
        }
      }
    `;
  }

  saveAll(variables: OperationVariables & {allOrdre: Ordre[]}) {
    // type Response = { allOrdre: RelayPage<Ordre> };
    return this.watchSaveAllQuery({ variables }, 1, this.queryFilter);
  }

}
