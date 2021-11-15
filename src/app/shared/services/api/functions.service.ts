import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

type Response = { res: number, msg?: string };

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
      query: gql`
        query OfValideEntrepotForOrdre($entrepotID: String) {
          ofValideEntrepotForOrdre(entrepotID:$entrepotID) {
            res
            msg
          }
        }
      `,
      variables: { entrepotID },
      fetchPolicy: 'network-only',
    })

}
