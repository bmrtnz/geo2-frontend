import {Injectable} from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Entrepot } from '../models';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import { MutationOptions } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class EntrepotsService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|description|raisonSocial|ville|valide)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Entrepot);
  }

  getOne(id: string) {
    const query = this.buildGetOne();
    type Response = { entrepot: Entrepot };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, inputVariables).toPromise();

          const query = this.buildGetAll();
          type Response = { allEntrepot: RelayPage<Entrepot> };

          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            ...inputVariables,
          };

          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allEntrepot)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.fieldsFilter);
          type Response = { entrepot: Entrepot };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.entrepot),
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
