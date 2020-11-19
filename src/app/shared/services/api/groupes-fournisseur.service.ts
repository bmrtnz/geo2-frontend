import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';
import { Apollo } from 'apollo-angular';
import { GroupeFournisseur } from '../../models';
import { WatchQueryOptions, OperationVariables } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupesFournisseurService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, GroupeFournisseur);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          type Response = { allGroupeFournisseur: RelayPage<GroupeFournisseur> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allGroupeFournisseur)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne();
          type Response = { groupeFournisseur: GroupeFournisseur };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.groupeFournisseur),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
