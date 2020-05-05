import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Incoterm } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IncotermsService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'description',
    'lieu',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Incoterm');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allIncoterm: RelayPage<Incoterm> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allIncoterm.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.baseFields);
    type Response = { incoterm: Incoterm };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables: RelayPageVariables = {}) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allIncoterm: RelayPage<Incoterm> };
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          if (options.searchValue) variables.search = options.searchValue;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allIncoterm)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { incoterm: Incoterm };
          variables.id = key;
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.incoterm),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
