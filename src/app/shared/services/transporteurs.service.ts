import { Injectable } from '@angular/core';
import { Transporteur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class TransporteursService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|raisonSocial|description|ville|codePostal|adresse1|valide)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Transporteur);
  }

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { transporteur: Transporteur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allTransporteur: RelayPage<Transporteur> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allTransporteur)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1);
          type Response = { transporteur: Transporteur };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.transporteur),
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
