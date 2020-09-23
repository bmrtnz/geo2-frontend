import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPage, RelayPageVariables } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { ConditionVente } from '../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConditionsVenteService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, ConditionVente);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allConditionVente: RelayPage<ConditionVente> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allConditionVente)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { conditionVente: ConditionVente };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.conditionVente),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
