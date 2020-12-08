import {Apollo} from 'apollo-angular';
import {MutationOptions, OperationVariables, WatchQueryOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';


import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { GridConfig } from '../../models';
import { APIPersist, APIRead, ApiService, RelayPage, RelayPageVariables } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class GridsConfigsService extends ApiService implements APIRead, APIPersist {

  fieldsFilter = /.*/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, GridConfig);
    this.gqlKeyType = 'GeoGridConfigKeyInput';
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ['utilisateur', 'grid'],
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(1, this.fieldsFilter);
          type Response = { allGridConfig: RelayPage<GridConfig> };
          const variables = this.mapLoadOptionsToVariables(options);

          return this.
            query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
            .pipe(
              map(res => this.asListCount(res.data.allGridConfig)),
              map(res => ({
                ...res,
                data: res.data.map(entity => new GridConfig(entity))
              })),
              take(1),
            )
            .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { gridConfig: GridConfig };
          const variables = { id: key };
          return this.
            query<Response>(query, { variables } as WatchQueryOptions<any>)
            .pipe(
              map(res => new GridConfig(res.data.gridConfig)),
              take(1),
            )
            .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave();
    return this.mutate(mutation, { variables } as MutationOptions).pipe(take(1));
  }

}
