import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Courtier } from '../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CourtierService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'raisonSocial',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Courtier');
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          console.log(query);
          type Response = { allCourtier: RelayPage<Courtier> };
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allCourtier)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { courtier: Courtier };
          variables = { ...variables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
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
