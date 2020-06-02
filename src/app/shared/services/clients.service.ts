import { Injectable } from '@angular/core';
import { Client } from '../models';
import { ApiService, RelayPage, APIRead, RelayPageVariables, APIPersist } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions, MutationOptions } from 'apollo-client';
import { map, take } from 'rxjs/operators';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends ApiService implements APIRead, APIPersist {

  listRegexp = /.*\.(?:id|raisonSocial|description|ville|valide)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Client);
  }

  getOne(id: string) {
    const query = this.buildGetOne();
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allClient: RelayPage<Client> };
          const variables = {
            ...inputVariables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allClient)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne();
          type Response = { client: Client };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.client),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  save(variables: OperationVariables) {
    const mutation = this.buildSave(1, this.listRegexp);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
