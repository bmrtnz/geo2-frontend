import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import { Secteur } from '../models';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import { variable } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class SecteursService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'description',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Secteur');
  }

  getAll(variables?: RelayPageVariables) {
    const query = this.buildGetAll(this.baseFields);
    type Response = { allSecteur: RelayPage<Secteur> };
    if (variables && variables.page > -1)
      return this.query<Response>(query, { variables } as WatchQueryOptions);
    return this.queryAll<Response>(
      query,
      (res) => res.data.allSecteur.pageInfo.hasNextPage,
      { variables } as WatchQueryOptions,
    );
  }

  getOne(id: string) {
    const query = this.buildGetOne(this.baseFields);
    type Response = { secteur: Secteur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables } as WatchQueryOptions);
  }

  getDataSource(variables: RelayPageVariables = {}) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allSecteur: RelayPage<Secteur> };
          this.pageSize = options.take;
          variables.offset = options.take;
          variables.page = options.skip / options.take;
          if (options.searchValue) variables.search = options.searchValue;
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions)
          .pipe(
            map( res => this.asListCount(res.data.allSecteur)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { secteur: Secteur };
          variables.id = key;
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.secteur),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
