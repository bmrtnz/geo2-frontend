import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Apollo } from 'apollo-angular';
import { AuthService } from '..';
import { ModificationsService } from './modification.service';

type GQLResponse = {
  countClient: number, // pre-saisie + modification
  countFournisseur: number, // pre-saisie + modification
  countTransporteur: number, // pre-saisie + modification
  countLieuPassageAQuai: number, // pre-saisie + modification
  countEntrepot: number, // pre-saisie + modification
  countArticle: number, // pre-saisie
};

@Injectable({
  providedIn: 'root'
})
export class ValidationService extends ApiService {

  private countQuery = `
    query CountValidation(
      $searchPresaisie: String,
      $searchPresaisieModif: String,
    ) {
      countClient(search: $searchPresaisieModif)
      countFournisseur(search: $searchPresaisieModif)
      countTransporteur(search: $searchPresaisieModif)
      countLieuPassageAQuai(search: $searchPresaisieModif)
      countEntrepot(search: $searchPresaisieModif)
      countArticle(search: $searchPresaisie)
    }
    `;

  constructor(
    private authService: AuthService,
    private modificationsService: ModificationsService,
    apollo: Apollo
    ) {
    super(apollo);
   }

  /**
   * Fetch Tiers/Articles forms count with unvalidated status
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
        ['preSaisie', '=', true],
        'and',
        ['valide', '<>', true],
      ]);

      const searchPresaisieModif = this.mapDXFilterToRSQL([
        ['preSaisie', '=', true],
      ]);

      this.listenQuery<GQLResponse>(
        this.countQuery,
        { variables: { searchPresaisie, searchPresaisieModif }, fetchPolicy: 'no-cache'},
        res => resolve(res.data),
      );
    });
  }

  public showToValidateBadges() {

    const tiersListe = ['Client', 'Fournisseur', 'Transporteur', 'LieuPassageAQuai', 'Entrepot'];

     // Only showed when admin user
    if (!this.authService.currentUser.adminClient) return;

    this.fetchUnvalidatedCount().then(res => {

      const counters = {...res, countTiers: 0};

      // Calculate unvalidated total tiers number
      Object.keys(counters).map( counter => {
        if (tiersListe.includes(counter.replace('count', ''))) counters.countTiers += counters[counter];
      });

      // Show categories with unvalidated forms (red badge)
      Object.keys(counters).map( counter => {
        const menuTitle = document.querySelector('.' + counter + '.toValidate-indicator');
        if (counters[counter]) {
          menuTitle?.classList.remove('display-none');
          if (menuTitle) menuTitle.innerHTML = counters[counter];
        } else {
          menuTitle?.classList.add('display-none');
        }
      });

    });

  }

}
