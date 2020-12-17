import { Injectable } from '@angular/core';
import { OperationVariables } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Client } from '../../models';
import { APIPersist, APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends ApiService implements APIRead, APIPersist {

  fieldsFilter = /.*\.(?:id|code|raisonSocial|description|ville|valide|commentaire|userModification|dateModification|typeTiers)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Client);
  }

  getOne(id: string) {
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables }, 2);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll();
          type Response = { allClient: RelayPage<Client> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allClient)
              resolve(this.asInstancedListCount(res.data.allClient));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { client: Client };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.client)
              resolve(res.data.client);
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables }, 2, this.fieldsFilter);
  }
}
