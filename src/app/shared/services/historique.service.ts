import {Injectable} from '@angular/core';
import {ApiService, RelayPage, RelayPageVariables} from './api.service';
import {Apollo} from 'apollo-angular';
import {Historique} from '../models';
import {MutationOptions, OperationVariables, WatchQueryOptions} from 'apollo-client';
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

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {
          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allHistorique: RelayPage<Historique> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.query<Response>(query, {variables, fetchPolicy: 'no-cache'} as WatchQueryOptions<RelayPageVariables>)
            .pipe(
              map(res => this.asListCount(res.data.allHistorique)),
              take(1),
            )
            .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { historique: Historique };
          const variables = { id: key};
          return this.query<Response>(query, { variables } as WatchQueryOptions<any>)
            .pipe(
              map(res => res.data.historique),
              take(1),
            )
            .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
