import {Apollo} from 'apollo-angular';
import {WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';


import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { Certification } from '../../models';
import { APIRead, ApiService, RelayPage, RelayPageVariables } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CertificationsService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Certification);
    this.gqlKeyType = 'Int';
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
          type Response = { allCertification: RelayPage<Certification> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allCertification)),
            map( res => ({
              ...res,
              data: res.data.map( entity => new Certification(entity))
            })),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { certification: Certification };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => new Certification(res.data.certification)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
