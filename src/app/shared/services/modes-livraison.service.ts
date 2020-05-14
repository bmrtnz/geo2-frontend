import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { ModeLivraison } from '../models';
import ArrayStore from 'devextreme/data/array_store';

@Injectable({
  providedIn: 'root'
})
export class ModesLivraisonService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'ModeLivraison');
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      key: this.keyField,
      store: new ArrayStore({
        data: Object.entries(ModeLivraison)
        .map(([value]) => value),
      }),
    });
  }

}
