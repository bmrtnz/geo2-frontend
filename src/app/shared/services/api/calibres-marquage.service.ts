import {Apollo} from 'apollo-angular';
import {OperationVariables, WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';

import { CalibreMarquage } from '../../models';

import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CalibresMarquageService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, CalibreMarquage);
    this.gqlKeyType = 'GeoProduitWithEspeceIdInput';
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        key: ['id', 'especeId'],
        load: async (options: LoadOptions) => {
          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allCalibreMarquage: RelayPage<CalibreMarquage> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allCalibreMarquage)),
            map( res => ({
              ...res,
              data: res.data.map( entity => new CalibreMarquage(entity))
            })),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { calibreMarquage: CalibreMarquage };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { id };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => new CalibreMarquage(res.data.calibreMarquage)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
