import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPage, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { BaseTarif } from '../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BasesTarifService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, BaseTarif);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, variables).toPromise();

          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allBaseTarif: RelayPage<BaseTarif> };
          variables = this.mergeVariables(this.mapLoadOptionsToVariables(options), variables);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allBaseTarif)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { baseTarif: BaseTarif };
          variables = { ...variables, [this.keyField]: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.baseTarif),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
