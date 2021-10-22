import { Apollo } from 'apollo-angular';
import { OperationVariables } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Modification } from '../../models';
import { ApiService, APIRead, RelayPage } from '../api.service';


import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class ModificationsService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|entite|entiteID|dateModification|initiateur|corps|statut)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Modification);
  }

  getOne(id: number) {
    const variables: OperationVariables = { id };
    type Response = { modification: Modification };
    return this.watchGetOneQuery<Response>({variables});
  }

  getDataSource_v2(columns: Array<string>) {
    type Response = { allModification: RelayPage<Modification> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll_v2(columns);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, {variables}, res => {
            if (res.data && res.data.allModification)
              resolve(this.asInstancedListCount(res.data.allModification));
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables, depth = 2) {
    return this.watchSaveQuery({ variables }, depth);
  }

}
