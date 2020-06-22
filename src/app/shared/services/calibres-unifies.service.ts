import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { CalibreUnifie } from '../models';
import { OperationVariables, WatchQueryOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CalibresUnifiesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, CalibreUnifie);
    this.gqlKeyType = 'GeoProduitWithEspeceIdInput';
  }

  getDataSource(inputVariables?: OperationVariables | RelayPageVariables) {
    return new DataSource({
      store: this.createCustomStore({
        key: ['id', 'especeId'],
        load: (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options, inputVariables).toPromise();

          const query = this.buildGetAll(1, this.listRegexp);
          type Response = { allCalibreUnifie: RelayPage<CalibreUnifie> };
          const variables = {
            ...this.mapLoadOptionsToVariables(options),
            ...inputVariables,
          };
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allCalibreUnifie)),
            map( res => ({
              ...res,
              data: res.data.map( entity => new CalibreUnifie(entity))
            })),
            take(1),
          )
          .toPromise();
        },
        byKey: (key) => {
          const query = this.buildGetOne();
          type Response = { calibreUnifie: CalibreUnifie };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { ...inputVariables, id };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => new CalibreUnifie(res.data.calibreUnifie)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

}
