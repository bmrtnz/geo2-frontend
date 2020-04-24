import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Pays } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class PaysService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetAll('allPays', fields);
    type Response = { allPays: RelayPage<Pays> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allPays.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetOne('pays', id, fields);
    type Response = { pays: Pays };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
