import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { ApiService } from '../api.service';

export type Response = { res: number, msg?: string };

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  constructor(
    private apollo: Apollo,
  ) { }

  /**
   * Vérifie si la création de l'ordre pour l'entrepot est autorisé
   */
  public ofValideEntrepotForOrdre =
    (entrepotID: string) => this.apollo.watchQuery<Response>({
      query: gql(ApiService.buildGraph(
        'query',
        [
          {
            name: 'ofValideEntrepotForOrdre',
            body: ['res', 'msg'],
            params: [{ name: 'entrepotID', value: 'entrepotID', isVariable: true }]
          }
        ],
        [
          { name: 'entrepotID', type: 'String', isOptionnal: false }
        ],
      )),
      variables: { entrepotID },
      fetchPolicy: 'network-only',
    })

  // public visualiserOrdreBAF =
  //   () => this.apollo.watchQuery<Response>({
  //     query: ApiService.buildGraph(),
  //     variables: {},
  //     fetchPolicy: 'cache-and-network',
  //   })

}
