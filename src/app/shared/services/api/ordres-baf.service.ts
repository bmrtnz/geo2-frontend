import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import OrdreBaf from 'app/shared/models/ordre-baf.model';
import { ApiService, APIRead, APICount, RelayPage } from '../api.service';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { first } from 'rxjs/operators';

export type CountResponse = { countOrdreBaf: number };

@Injectable({
  providedIn: 'root'
})
export class OrdresBafService extends ApiService implements APIRead, APICount<CountResponse> {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreBaf);
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll_v2(columns);
          type Response = { allOrdreBaf: RelayPage<OrdreBaf> };

          const variables = {
            // ...this.persistantVariables,
            ...this.mapLoadOptionsToVariables(options)
          };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreBaf) {
              resolve(this.asInstancedListCount(res.data.allOrdreBaf));
            }
          });
        }),
        byKey: this.byKey(columns),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return key =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordreBaf: OrdreBaf };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.ordreBaf)
            resolve(new OrdreBaf(res.data.ordreBaf));
        });
      });
  }

  count(dxFilter?: any[]) {
    const search = this.mapDXFilterToRSQL(dxFilter);
    return this.watchCountQuery<CountResponse>(search).pipe(first());
  }

}
