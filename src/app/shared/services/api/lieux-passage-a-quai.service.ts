import {Apollo} from 'apollo-angular';
import {WatchQueryOptions, OperationVariables, MutationOptions, defaultDataIdFromObject, ApolloQueryResult} from '@apollo/client/core';
import { Injectable, OnDestroy } from '@angular/core';
import { LieuPassageAQuai } from '../../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';


import { LoadOptions } from 'devextreme/data/load_options';
import { concatMap, filter, map, mergeAll, mergeMap, switchMap, take, takeLast, takeUntil, takeWhile, tap } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import { from, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|raisonSocial|description|ville|codePostal|adresse1|valide|typeTiers)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, LieuPassageAQuai);
  }

  getOne(id: string) {
    const variables: OperationVariables = { id };
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    return this.watchGetOneQuery<Response>({variables});
  }

  getDataSource() {
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll();
          const variables = this.mapLoadOptionsToVariables(options);

          this.loadPaginatedQuery<Response>(query, {variables}, res => {
            if (res.data && res.data.allLieuPassageAQuai)
              resolve(this.asInstancedListCount(res.data.allLieuPassageAQuai));
          });
        }),
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1, this.fieldsFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
