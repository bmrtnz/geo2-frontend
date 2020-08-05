import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { NatureStation } from '../models';
import ArrayStore from 'devextreme/data/array_store';

@Injectable({
  providedIn: 'root'
})
export class NaturesStationService {

  constructor() { }

  getDataSource() {
    return new DataSource({
      // key: this.keyField,
      store: new ArrayStore({
        data: Object.entries(NatureStation)
        .map(([value]) => value),
      }),
    });
  }

}
