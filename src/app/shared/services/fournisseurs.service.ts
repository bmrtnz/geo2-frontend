import {Injectable} from '@angular/core';
import {BasePaiement, Fournisseur, Devise, MoyenPaiement, Pays, Personne, RegimeTva, Secteur} from '../models';
import {FakeService} from './fake.service';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class FournisseursService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
    private fakeService: FakeService
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { description }', 'ville' ];
    const query = this.buildGetAll('allFournisseur', fields);
    type Response = { allFournisseur: RelayPage<Fournisseur> };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getOne(id: string) {
    const fields = [ 'id', 'raisonSocial', 'pays { description }', 'ville' ];
    const query = this.buildGetOne('fournisseur', id, fields);
    type Response = { fournisseur: Fournisseur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

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
