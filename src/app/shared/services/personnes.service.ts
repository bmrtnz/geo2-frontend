import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Personne } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class PersonnesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'nomUtilisateur', 'valide' ];
    const query = this.buildGetAll('allPersonne', fields);
    type Response = { allPersonne: RelayPage<Personne> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allPersonne.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [ 'id', 'nomUtilisateur', 'valide' ];
    const query = this.buildGetOne('personne', id, fields);
    type Response = { personne: Personne };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
