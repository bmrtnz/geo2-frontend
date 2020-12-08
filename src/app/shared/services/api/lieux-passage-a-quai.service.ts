import { Injectable } from '@angular/core';
import { LieuPassageAQuai } from '../../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take, takeLast, takeUntil, takeWhile, tap } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import { Subject } from 'rxjs';

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

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'network-only' } as WatchQueryOptions);
  }

  getDataSource() {
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return new DataSource({
      store: this.createCustomStore({
        // DX doesn't support observable here,
        // and we can only emit a single response as Promise
        load: (options: LoadOptions) => new Promise(async (resolve, reject) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll();
          const variables = this.mapLoadOptionsToVariables(options);
          const done = new Subject();

          this.query<Response>(query, {
            variables,
            fetchPolicy: 'cache-and-network',
          } as WatchQueryOptions<RelayPageVariables>)
          .pipe(takeUntil(done))
          .subscribe(res => {
            console.log(res);
            if (res.data && res.data.allLieuPassageAQuai) {
              console.log('resolving with :', JSON.stringify(res.data.allLieuPassageAQuai));
              resolve(this.asListCount(res.data.allLieuPassageAQuai));
            }
            if (!res.loading) {
              done.next();
              done.complete();
            }
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
