import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { Contact } from '../models';
import { OperationVariables, WatchQueryOptions, MutationOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactsService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'valide',
    'societe { id raisonSocial }',
    'nom',
    'prenom',
    'codeTiers',
    'typeTiers',
  ];

  allFields = [
    ...this.baseFields,
    'flux { id description }',
    'fluxAccess1',
    'fluxAccess2',
    'fluxComponent',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'Contact');
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allContact: RelayPage<Contact> };

          // Merge search
          const search = [];
          const loadVariables = this.mapLoadOptionsToVariables(options);
          if (inputVariables.search) search.push(inputVariables.search);
          if (loadVariables.search) search.push(loadVariables.search);
          const variables = {
            ...loadVariables,
            search: search.join(' and ')
          };

          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allContact)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { contact: Contact };
          const variables = { ...inputVariables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.contact),
            take(1),
          )
          .toPromise();
        },
        insert: (values) => {
          const variables = { contact: values };
          const mutation = this.buildSave(this.baseFields);
          return this
          .mutate(mutation, { variables } as MutationOptions<any, any>)
          .toPromise();
        },
        update: (key, values) => {
          const variables = { contact: { id: key, ...values }};
          const mutation = this.buildSave(this.baseFields);
          return this
          .mutate(mutation, { variables } as MutationOptions<any, any>)
          .toPromise();
        },
        remove: (key) => {
          const mutation = this.buildDelete();
          return this
          .mutate(mutation, { variables: { id: key } } as MutationOptions<any, any>)
          .toPromise();
        },
      }),
    });
  }

  save(variables: OperationVariables) {
    const mutation = this.buildSave(this.baseFields);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
