import { Injectable } from '@angular/core';
import { FakeService } from './fake.service';
import { Article } from '../models';

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

}


