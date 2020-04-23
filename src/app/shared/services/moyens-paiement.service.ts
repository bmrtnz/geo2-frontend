import { Injectable } from '@angular/core';
import { ApiService, RelayPageVariables, RelayPage, APIRead } from './api.service';
import { Apollo } from 'apollo-angular';
import { MoyenPaiement } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class MoyensPaiementService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetAll('allMoyenPaiement', fields);
    type Response = { allMoyenPaiement: RelayPage<MoyenPaiement> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allMoyenPaiement.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const fields = [ 'id', 'description', 'valide' ];
    const query = this.buildGetOne('moyenPaiement', id, fields);
    type Response = { moyenPaiement: MoyenPaiement };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

}
