import { Injectable } from '@angular/core';
import { FakeService } from './fake.service';
import { Article, Espece, Variete, TypeVarietal, ModeCulture, Origine, CalibreUnifie,
    Coloration, TypeVente} from '../models';

export class Tab {
    id: string;
}

const tabs: Tab[] = [{
    id: '1'
}, {
    id: '2'
}, {
    id: '3'
}, {
    id: '4'
}, {
    id: '5'
}];

@Injectable({
    providedIn: 'root'
  })

  export class ArticlesService {

    constructor(
        private fakeService: FakeService
      ) { }

    getTabs(): Tab[] {
        return tabs;
    }

    get(code?: string) {
        return this.fakeService.get(Article, code);
    }

    getEspeces() {
        return this.fakeService.get(Espece);
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
    getColoration() {
        return this.fakeService.get(Coloration);
    }
    getTypeVente() {
        return this.fakeService.get(TypeVente);
    }

}


