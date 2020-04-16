import {Injectable} from '@angular/core';
import {BasePaiement, Client, Devise, MoyenPaiement, Pays, Personne, RegimeTva, Secteur} from '../models';
import {FakeService} from './fake.service';
import { ApiService, RelayPage, APIRead, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
    private fakeService: FakeService
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { description }', 'ville', 'secteur { description }' ];
    const query = this.buildGetAll('allClient', fields);
    type Response = { allClient: RelayPage<Client> };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getOne(id: string) {
    const fields = [
      'id',
      'raisonSocial',
      'pays { description }',
      'ville',
      'secteur { id description }',
      'code',
      'siret',
      'ifco',
      'adresse1',
      'adresse2',
      'adresse3',
      'codePostal',
      'facturationRaisonSocial',
      'facturationAdresse1',
      'facturationAdresse2',
      'facturationAdresse3',
      'facturationCodePostal',
      'facturationVille',
      'facturationPays { description }',
      'lieuFonctionEAN',
      'langue { description }',
      'tvaCee',
      'referenceCoface',
      'soumisCtifl',
      'typeClient { description }',
      'compteComptable',
      'nbJourEcheance',
      'echeanceLe',
      'incoterm { description }',
      'regimeTva { description }',
      'devise { description }',
      'commentaireHautFacture',
      'commentaireBasFacture',
    ];
    const query = this.buildGetOne('client', id, fields);
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  // update(variables: OperationVariables) {
  //   return this.mutate(`
  //     mutation SaveClient($client: GeoClientInput!) {
  //       saveClient(client: $client) {
  //         id
  //       }
  //     }
  //   `, { variables } as MutationOptions);
  // }

  getSecteurs() {
    return this.fakeService.get(Secteur);
  }

  async getCommerciaux() {
    const personnes = await this.fakeService.get(Personne);

    return personnes.filter(p => p.role === 'C');
  }

  async getAssistantes() {
    const personnes = await this.fakeService.get(Personne);

    return personnes.filter(p => p.role === 'A');
  }

  getPays() {
    return this.fakeService.get(Pays);
  }

  getDevises() {
    return this.fakeService.get(Devise);
  }

  getMoyenPaiements() {
    return this.fakeService.get(MoyenPaiement);
  }

  getBasePaiements() {
    return this.fakeService.get(BasePaiement);
  }

  getRegimeTva() {
    return this.fakeService.get(RegimeTva);
  }
}
