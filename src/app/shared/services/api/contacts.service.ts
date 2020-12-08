import {Apollo} from 'apollo-angular';
import {OperationVariables, WatchQueryOptions, MutationOptions} from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';

import { Contact } from '../../models';

import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactsService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Contact);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allContact: RelayPage<Contact> };

          const variables = this.mapLoadOptionsToVariables(options);

          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allContact)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { contact: Contact };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.contact),
            take(1),
          )
          .toPromise();
        },
        insert: async (values) => {
          const variables = { contact: values };
          const mutation = await this.buildSave();
          return this
          .mutate(mutation, { variables } as MutationOptions<any, any>)
          .toPromise();
        },
        update: async (key, values) => {
          const variables = { contact: { id: key, ...values }};
          const mutation = await this.buildSave();
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

}
