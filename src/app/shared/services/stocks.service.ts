import { Injectable } from '@angular/core';
import { ApiService, RelayPage, APIRead, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions } from 'apollo-client';
import { map, take } from 'rxjs/operators';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StocksService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|raisonSocial|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Stock);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allStock: RelayPage<Stock> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allStock)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { stock: Stock };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.stock),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
