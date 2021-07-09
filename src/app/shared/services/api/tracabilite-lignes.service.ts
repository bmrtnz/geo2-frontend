import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import TracabiliteLigne from 'app/shared/models/tracabilite-ligne.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class TracabiliteLignesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, TracabiliteLigne);
  }

  getDataSource(depth = 1, filter?: RegExp) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(depth, filter);
          type Response = { allTracabiliteLigne: RelayPage<TracabiliteLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allTracabiliteLigne)
              resolve(this.asInstancedListCount(res.data.allTracabiliteLigne));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(depth, filter);
          type Response = { tracabiliteLigne: TracabiliteLigne };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.tracabiliteLigne)
              resolve(new TracabiliteLigne(res.data.tracabiliteLigne));
          });
        }),
      }),
    });
  }

}
