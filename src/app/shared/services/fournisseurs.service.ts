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

  byKeyFilter = /.*\.(?:id|raisonSocial|description|ville|valide|commentaire|userModification|dateModification|typeTiers)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Fournisseur);
  }

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { fournisseur: Fournisseur };
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

          const variables = this.mapLoadOptionsToVariables(options);
          const query = await this.buildGetAll(1);
          type Response = { allFournisseur: RelayPage<Fournisseur> };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allFournisseur)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1);
          type Response = { fournisseur: Fournisseur };
          const variables = { id: key };
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

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1, this.byKeyFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
