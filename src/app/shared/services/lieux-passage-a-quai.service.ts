import {Injectable} from '@angular/core';
import {BasePaiement, LieuPassageAQuai, Devise, MoyenPaiement, Pays, RegimeTva} from '../models';
import {FakeService} from './fake.service';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
    private fakeService: FakeService
  ) {
    super(apollo);
  }

  getAll(variables?: RelayPageVariables) {
    const fields = [ 'id', 'raisonSocial', 'pays { description }', 'ville' ];
    const query = this.buildGetAll('allLieuPassageAQuai', fields);
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getOne(id: string) {
    const fields = [ 'id', 'raisonSocial', 'pays { description }', 'ville' ];
    const query = this.buildGetOne('lieuPassageAQuai', id, fields);
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
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
