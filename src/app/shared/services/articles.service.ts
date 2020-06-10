import { Injectable } from '@angular/core';
import { FakeService } from './fake.service';
import { Article, Espece, Variete, TypeVarietal, ModeCulture, Origine, CalibreUnifie,
    CalibreMarquage, Coloration, TypeVente, Stickeur, Marque, Emballage, ConditionsSpecial,
    Alveole, Categorie, Penetro, Rangement, Cirage, Sucre,
    EtiqClient, EtiqUC, EtiqEvt, GroupeEmballage } from '../models';

@Injectable({
    providedIn: 'root'
  })

  export class ArticlesService {

    constructor(
        private fakeService: FakeService
      ) { }

    get(code?: string) {
        return this.fakeService.get(Article, code);
    }

    getEspeces() {
        return this.fakeService.get(Espece);
    }
    getGroupeEmballage() {
        return this.fakeService.get(GroupeEmballage);
    }
    getVarietes() {
        return this.fakeService.get(Variete);
    }
    getTypeVarietal() {
        return this.fakeService.get(TypeVarietal);
    }
    getModeCulture() {
        return this.fakeService.get(ModeCulture);
    }
    getOrigine() {
        return this.fakeService.get(Origine);
    }
    getCalibreUnifie() {
        return this.fakeService.get(CalibreUnifie);
    }
    getCalibreMarquage() {
        return this.fakeService.get(CalibreMarquage);
    }
    getColoration() {
        return this.fakeService.get(Coloration);
    }
    getTypeVente() {
        return this.fakeService.get(TypeVente);
    }
    getStickeur() {
        return this.fakeService.get(Stickeur);
    }
    getMarque() {
        return this.fakeService.get(Marque);
    }
    getEmballage() {
        return this.fakeService.get(Emballage);
    }
    getConditionsSpecial() {
        return this.fakeService.get(ConditionsSpecial);
    }
    getAlveole() {
        return this.fakeService.get(Alveole);
    }
    getCategorie() {
        return this.fakeService.get(Categorie);
    }
    getCirage() {
        return this.fakeService.get(Cirage);
    }
    getPenetro() {
        return this.fakeService.get(Penetro);
    }
    getSucre() {
        return this.fakeService.get(Sucre);
    }
    getRangement() {
        return this.fakeService.get(Rangement);
    }
    getEtiqClient() {
        return this.fakeService.get(EtiqClient);
    }
    getEtiqUC() {
        return this.fakeService.get(EtiqUC);
    }
    getEtiqEvt() {
        return this.fakeService.get(EtiqEvt);
    }

}


