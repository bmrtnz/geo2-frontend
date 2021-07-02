import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { OrdreLigne } from '../../models/ordre-ligne.model';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdreLignesService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreLigne);
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allOrdreLigne: RelayPage<OrdreLigne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLigne)
              resolve(this.asInstancedListCount(res.data.allOrdreLigne));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { ordreLigne: OrdreLigne };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordreLigne)
              resolve(new OrdreLigne(res.data.ordreLigne));
          });
        }),
      }),
    });
  }

}
