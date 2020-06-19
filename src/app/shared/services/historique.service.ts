import {Injectable} from '@angular/core';
import {ApiService, RelayPage, RelayPageVariables} from './api.service';
import {Apollo} from 'apollo-angular';
import {Historique} from '../models';
import {OperationVariables, WatchQueryOptions} from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import {LoadOptions} from 'devextreme/data/load_options';
import {map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService extends ApiService {

  listRegexp = /.*\.(?:id)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Historique);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allHistorique: RelayPage<Historique> };
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          if (options.searchValue) {
            variables.search = options.searchValue;
          }
          return this.query<Response>(query, {variables, fetchPolicy: 'no-cache'} as WatchQueryOptions<RelayPageVariables>)
            .pipe(
              map(res => this.asListCount(res.data.allHistorique)),
              take(1),
            )
            .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.listRegexp);
          type Response = { historique: Historique };
          variables = {...variables, id: key};
          return this.query<Response>(query, {variables} as WatchQueryOptions)
            .pipe(
              map(res => res.data.historique),
              take(1),
            )
            .toPromise();
        },
      }),
    });
  }

}
