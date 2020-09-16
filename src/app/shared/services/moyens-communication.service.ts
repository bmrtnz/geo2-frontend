import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { MoyenCommunication } from '../models';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MoyenCommunicationService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MoyenCommunication);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = this.buildGetAll();
          type Response = { allMoyenCommunication: RelayPage<MoyenCommunication> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allMoyenCommunication)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne();
          type Response = { moyenCommunication: MoyenCommunication };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.moyenCommunication),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}

