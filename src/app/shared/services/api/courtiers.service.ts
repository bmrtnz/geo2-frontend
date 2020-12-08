import {Apollo} from 'apollo-angular';
import {OperationVariables, WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';


import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Courtier } from '../../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CourtierService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Courtier);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allCourtier: RelayPage<Courtier> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allCourtier)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { courtier: Courtier };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.courtier),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
