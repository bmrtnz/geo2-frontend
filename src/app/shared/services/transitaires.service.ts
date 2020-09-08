import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Transitaire } from '../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransitairesService extends ApiService implements APIRead {

  listRegexp = /.*(?:id|raisonSocial)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Transitaire);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      sort: [
        { selector: 'description' }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, variables).toPromise();

          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allTransitaire: RelayPage<Transitaire> };
          variables = this.mergeVariables(this.mapLoadOptionsToVariables(options), variables);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allTransitaire)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { transitaire: Transitaire };
          variables = { ...variables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.transitaire),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
