import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { RegimeTva } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import { take, map } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';

@Injectable({
  providedIn: 'root'
})
export class RegimesTvaService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'description',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'RegimeTva');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allRegimeTva: RelayPage<RegimeTva> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allRegimeTva.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.baseFields);
    type Response = { regimeTva: RegimeTva };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables: RelayPageVariables = {}) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allRegimeTva: RelayPage<RegimeTva> };
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          if (options.searchValue) variables.search = options.searchValue;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allRegimeTva)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { regimeTva: RegimeTva };
          variables.id = key;
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.regimeTva),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
