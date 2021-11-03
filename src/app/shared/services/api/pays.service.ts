import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Pays } from '../../models';
import { APIRead, ApiService, RelayPage, APICount } from '../api.service';
import { first } from 'rxjs/operators';

export enum Operation {
  All = 'allPays',
  AllDistinct = 'allDistinctPays',
}

export type CountResponse = { countPays: number };

@Injectable({
  providedIn: 'root'
})
export class PaysService extends ApiService implements APIRead, APICount<CountResponse> {

  fieldsFilter = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Pays);
  }

  getDataSource(depth = 1, filter = this.fieldsFilter, operation = Operation.All) {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {
          const operationName = operation.valueOf();
          type Response = { [operationName: string]: RelayPage<Pays> };

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(depth, filter, operationName);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data[operationName])
              resolve(this.asInstancedListCount(res.data[operationName]));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(depth, filter);
          type Response = { pays: Pays };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.pays)
              resolve(new Pays(res.data.pays));
          });
        }),
      }),
    });
  }

  count(dxFilter?: any[]) {
    const search = this.mapDXFilterToRSQL(dxFilter);
    return this.watchCountQuery<CountResponse>(search).pipe(first());
  }

}
