import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPage, RelayPageVariables } from '../api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { BaseTarif } from '../../models';
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
          type Response = { allBaseTarif: RelayPage<BaseTarif> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allBaseTarif)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { baseTarif: BaseTarif };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
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
