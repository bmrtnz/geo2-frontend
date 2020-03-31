import {Injectable} from '@angular/core';
import {
  BasePaiement, Entrepot,
  Devise, MoyenPaiement, Pays, Personne, RegimeTva,
  TypePalette, TypeCamion, Transitaire, ModeLivraison, BaseTarif
} from '../models';
import {FakeService} from './fake.service';

@Injectable({
  providedIn: 'root'
})
export class EntrepotsService {

  constructor(
    private fakeService: FakeService
  ) { }

  get(id?: string) {
    return this.fakeService.get(Entrepot, id);
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

  getModeLivraison() {
    return this.fakeService.get(ModeLivraison);
  }

  getBaseTarif() {
    return this.fakeService.get(BaseTarif);
  }

  getTypePalette() {
    return this.fakeService.get(TypePalette);
  }

  getTypeCamion() {
    return this.fakeService.get(TypeCamion);
  }


  getTransitaire() {
    return this.fakeService.get(Transitaire);
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
