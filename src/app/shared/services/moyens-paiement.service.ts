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

  baseFields = [
    'id',
    'description',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'MoyenPaiement');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allMoyenPaiement: RelayPage<MoyenPaiement> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allMoyenPaiement.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.baseFields);
    type Response = { moyenPaiement: MoyenPaiement };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables: RelayPageVariables = {}) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allMoyenPaiement: RelayPage<MoyenPaiement> };
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          if (options.searchValue) variables.search = options.searchValue;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allMoyenPaiement)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { moyenPaiement: MoyenPaiement };
          variables.id = key;
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
