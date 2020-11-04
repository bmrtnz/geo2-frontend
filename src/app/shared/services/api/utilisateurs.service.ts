import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Utilisateur } from '../../models/utilisateur.model';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
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
    .query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
    .pipe(take(1));
  }
}
