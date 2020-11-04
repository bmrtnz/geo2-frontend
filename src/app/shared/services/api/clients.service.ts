import { Injectable } from '@angular/core';
import { Client } from '../../models';
import { ApiService, RelayPage, APIRead, RelayPageVariables, APIPersist } from '../api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions, MutationOptions } from 'apollo-client';
import { map, take } from 'rxjs/operators';
import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';

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

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { client: Client };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allClient: RelayPage<Client> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allClient)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { client: Client };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.client),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1, this.fieldsFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
