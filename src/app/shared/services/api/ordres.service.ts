import { Injectable } from '@angular/core';
import { gql, MutationOptions, OperationVariables, WatchQueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from } from 'rxjs';
import { mergeMap, take, takeUntil } from 'rxjs/operators';
import { Ordre } from '../../models/ordre.model';
import { APIPersist, APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdresService extends ApiService implements APIRead, APIPersist {

  queryFilter = /.*(?:id|numero|referenceClient|nomUtilisateur|raisonSocial)$/i;

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

  getDataSource() {
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

          const query = await this.buildGetAll(2, this.queryFilter);
          type Response = { allOrdre: RelayPage<Ordre> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdre)
              resolve(this.asInstancedListCount(res.data.allOrdre));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { ordre: Ordre };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordre)
              resolve(res.data.ordre);
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables) {
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

}
