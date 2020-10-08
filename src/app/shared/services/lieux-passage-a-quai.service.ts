import { Injectable } from '@angular/core';
import { LieuPassageAQuai } from '../models';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from './api.service';
import { Apollo } from 'apollo-angular';
import { WatchQueryOptions, OperationVariables, MutationOptions } from 'apollo-client';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';

@Injectable({
  providedIn: 'root'
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|raisonSocial|description|ville|codePostal|adresse1|valide)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, LieuPassageAQuai);
  }

  async getOne(id: string) {
    const query = await this.buildGetOne();
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource() {
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return new DataSource({
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          const query = await this.buildGetAll();
          if (options.group)
            return this.getDistinct(options).toPromise();

          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allLieuPassageAQuai)),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables) {
    const mutation = await this.buildSave(1, this.fieldsFilter);
    return this.mutate(mutation, { variables } as MutationOptions);
  }

}
