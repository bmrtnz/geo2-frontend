import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { TypeVente } from '../models';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TypesVenteService extends ApiService implements APIRead {

  baseFields = [
    'id',
    'description',
    'valide',
  ];

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, 'TypeVente');
  }

  getDataSource(variables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => {
          const query = this.buildGetAll(this.baseFields);
          type Response = { allTypeVente: RelayPage<TypeVente> };
          variables = {
            ...variables,
            ...this.mapLoadOptionsToVariables(options),
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allTypeVente)),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne(this.baseFields);
          type Response = { typeVente: TypeVente };
          variables = { ...variables, id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions)
          .pipe(
            map( res => res.data.typeVente),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
