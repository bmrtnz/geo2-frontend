import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { BureauAchat } from '../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BureauxAchatService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|raisonSocial)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, BureauAchat);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allBureauAchat: RelayPage<BureauAchat> };
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allBureauAchat)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { bureauAchat: BureauAchat };
          variables = { ...variables, [this.keyField]: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.bureauAchat),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
