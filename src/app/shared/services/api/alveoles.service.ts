import {Apollo} from 'apollo-angular';
import {WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';

import { Alveole } from '../../models';

import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlveolesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Alveole);
    this.gqlKeyType = 'GeoProduitWithEspeceIdInput';
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ['id', 'especeId'],
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allAlveole: RelayPage<Alveole> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allAlveole)),
            map( res => ({
              ...res,
              data: res.data.map( entity => new Alveole(entity))
            })),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { alveole: Alveole };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { id };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => new Alveole(res.data.alveole)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
