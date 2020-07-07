import { Injectable } from '@angular/core';
import { Fournisseur } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class FournisseursService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|raisonSocial|description|ville|valide)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Fournisseur);
  }

  getOne(id: string) {
    const query = this.buildGetOne();
    type Response = { fournisseur: Fournisseur };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {

    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, inputVariables).toPromise();

          const variables = this.mergeVariables(this.mapLoadOptionsToVariables(options), inputVariables);
          const query = this.buildGetAll();
          type Response = { allFournisseur: RelayPage<Fournisseur> };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allFournisseur)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(1, this.fieldsFilter);
          type Response = { fournisseur: Fournisseur };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.fournisseur),
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
