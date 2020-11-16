import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage, APIPersist } from '../api.service';
import { Apollo } from 'apollo-angular';
import { MutationOptions, OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { Ordre } from '../../models/ordre.model';

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

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { ordre: Ordre };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(1, this.queryFilter);
          type Response = { allOrdre: RelayPage<Ordre> };
          const variables = this.mapLoadOptionsToVariables(options);
          if (options.searchValue) variables.search = options.searchValue;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allOrdre)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { ordre: Ordre };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.ordre),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1, this.queryFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
