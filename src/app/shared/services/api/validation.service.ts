import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Apollo } from 'apollo-angular';

type GQLResponse = {
  countClient: number, // modification
  countFournisseur: number, // modification
  countTransporteur: number, // modification
  countLieuPassageAQuai: number, // modification
  countEntrepot: number, // modification
  countArticle: number, // pre-saisie
};

@Injectable({
  providedIn: 'root'
})
export class ValidationService extends ApiService {

  private countQuery = `
    query CountValidation(
      $searchModifications: String,
      $searchPresaisie: String
    ) {
      countClient(search: $searchModifications)
      countArticle(search: $searchPresaisie)
      countFournisseur(search: $searchModifications)
      countTransporteur(search: $searchModifications)
      countLieuPassageAQuai(search: $searchModifications)
      countEntrepot(search: $searchModifications)
    }
    `;

  constructor( apollo: Apollo ) {
    super(apollo);
  }

  /**
   * Fetch Tier/Article forms count with unvalidated status
   */
  public fetchUnvalidatedCount(): Promise<GQLResponse> {
    const commonFilter = [
      ['valide', '=', true],
    ];
    return new Promise( resolve => {

      const searchModifications = this.mapDXFilterToRSQL([
        ...commonFilter,
        'and',
        ['modifications.statut', '=', false],
      ]);

      const searchPresaisie = this.mapDXFilterToRSQL([
        ...commonFilter,
        'and',
        ['preSaisie', '=', true],
      ]);

      this.listenQuery<GQLResponse>(
        this.countQuery,
        { variables: { searchModifications, searchPresaisie }},
        res => resolve(res.data),
      );
    });
  }

}
