import {Apollo} from 'apollo-angular';
import {WatchQueryOptions, OperationVariables} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';

import { TypeClient } from '../../models';

import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TypesClientService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, TypeClient);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allTypeClient: RelayPage<TypeClient> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allTypeClient)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { typeClient: TypeClient };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.typeClient),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
