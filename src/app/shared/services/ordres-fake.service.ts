import { Injectable } from '@angular/core';

export class Content {
  id: number;
  tabTitle: string;
}

const contents: Content[] = [{
  id: 1,
  tabTitle: 'Suivi des ordres'
}];

@Injectable()
export class FakeOrdresService {
  getContents() {
    return contents;
  }
}
