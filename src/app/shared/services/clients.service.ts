import {Injectable} from '@angular/core';
import {BasePaiement, Client, Devise, MoyenPaiement, Pays, Personne, RegimeTva, Secteur} from '../models';
import {FakeService} from './fake.service';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(
    private fakeService: FakeService
  ) { }

  get(id?: string) {
    return this.fakeService.get(Client, id);
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
