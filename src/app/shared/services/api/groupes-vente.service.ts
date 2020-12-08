import {Apollo} from 'apollo-angular';
import {WatchQueryOptions, OperationVariables} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';

import { GroupeClient } from '../../models';

import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupesClientService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, GroupeClient);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allGroupeClient: RelayPage<GroupeClient> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allGroupeClient)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { groupeClient: GroupeClient };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.groupeClient),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
