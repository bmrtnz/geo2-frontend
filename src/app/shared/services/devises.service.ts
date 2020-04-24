import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Devise } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class DevisesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetAll('allDevise', fields);
    type Response = { allDevise: RelayPage<Devise> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allDevise.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetOne('devise', id, fields);
    type Response = { devise: Devise };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
