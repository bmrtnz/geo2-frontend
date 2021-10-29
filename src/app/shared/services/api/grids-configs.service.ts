import { Injectable } from '@angular/core';
import { OperationVariables } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { GridConfig } from '../../models';
import { APIPersist, APIRead, ApiService, RelayPage } from '../api.service';

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
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.fieldsFilter);
          type Response = { allGridConfig: RelayPage<GridConfig> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables, fetchPolicy: 'no-cache' }, res => {
            if (res.data && res.data.allGridConfig)
              resolve(this.asInstancedListCount(res.data.allGridConfig));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { gridConfig: GridConfig };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables, fetchPolicy: 'no-cache' }, res => {
            if (res.data && res.data.gridConfig)
              resolve(new GridConfig(res.data.gridConfig));
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables, fetchPolicy: 'no-cache' });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

}
