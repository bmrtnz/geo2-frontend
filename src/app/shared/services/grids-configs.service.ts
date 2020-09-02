import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage, APIPersist } from './api.service';
import { Apollo } from 'apollo-angular';
import { GridConfig } from '../models';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GridsConfigsService extends ApiService implements APIRead,APIPersist {

  fieldsFilter = /.*\.(?:id|nomUtilisateur)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, GridConfig);
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, variables).toPromise();

          const query = this.buildGetAll();
          type Response = { allGridConfig: RelayPage<GridConfig> };
          variables = this.mergeVariables(this.mapLoadOptionsToVariables(options), variables);

          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allGridConfig)),
            map( res => ({
              ...res,
              data: res.data.map( entity => new GridConfig(entity))
            })),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne();
          type Response = { gridConfig: GridConfig };
          variables = { ...variables, [this.keyField]: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => new GridConfig(res.data.gridConfig)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  save(variables: OperationVariables) {
    const mutation = this.buildSave(1, this.fieldsFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
