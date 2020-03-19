import {Injectable} from '@angular/core';
import {BasePaiement, LieuPassageAQuai, Devise, MoyenPaiement, Pays, RegimeTva} from '../models';
import {FakeService} from './fake.service';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService {

  constructor(
    private fakeService: FakeService
  ) { }

  get(id?: string) {
    return this.fakeService.get(LieuPassageAQuai, id);
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
