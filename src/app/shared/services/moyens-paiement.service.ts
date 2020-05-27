import { Injectable } from '@angular/core';
import { ApiService, RelayPageVariables, RelayPage, APIRead } from './api.service';
import { Apollo } from 'apollo-angular';
import { MoyenPaiement } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MoyensPaiementService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MoyenPaiement);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allMoyenPaiement: RelayPage<MoyenPaiement> };
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allMoyenPaiement)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { moyenPaiement: MoyenPaiement };
          variables = { ...variables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.moyenPaiement),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
