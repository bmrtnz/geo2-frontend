import { Injectable } from '@angular/core';
import { gql, OperationVariables, QueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { takeWhile } from 'rxjs/operators';
import { Utilisateur } from '../../models/utilisateur.model';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateursService extends ApiService {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Utilisateur);
  }

  getOne(
    nomUtilisateur: string,
    motDePasse: string,
    columns: Array<string>,
    options?: Partial<QueryOptions>,
  ) {
    return this.apollo.query<{ utilisateur: Utilisateur }>({
      query: gql(ApiService.buildGraph(
        'query',
        [
          {
            name: this.model.name.lcFirst(),
            body: columns,
            params: [
              { name: 'nomUtilisateur', value: 'nomUtilisateur', isVariable: true },
              { name: 'motDePasse', value: 'motDePasse', isVariable: true },
            ],
          },
        ],
        [
          { name: 'nomUtilisateur', type: 'String', isOptionnal: false },
          { name: 'motDePasse', type: 'String', isOptionnal: false },
        ],
      )),
      variables: { nomUtilisateur, motDePasse },
      ...options,
    })
    .pipe(takeWhile(res => res.loading === false));
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }
}
