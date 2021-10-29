import {Apollo} from 'apollo-angular';
import {OperationVariables, WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Utilisateur } from '../../models/utilisateur.model';


import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateursService extends ApiService {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Utilisateur);
  }

  async getOne(nomUtilisateur: string, motDePasse: string) {
    const query = `
      query Utilisateur($nomUtilisateur: String!,$motDePasse: String!) {
        utilisateur(nomUtilisateur:$nomUtilisateur,motDePasse:$motDePasse) {
          ${ await this.model.getGQLFields().toPromise() }
        }
      }
    `;
    type Response = { utilisateur: Utilisateur };
    const variables: OperationVariables = { nomUtilisateur, motDePasse };
    return this
    .query<Response>(query, {
      variables,
      fetchPolicy: 'no-cache',
      returnPartialData: false,
    } as WatchQueryOptions)
    .pipe(take(1));
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }
}
