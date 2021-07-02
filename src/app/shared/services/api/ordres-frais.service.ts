import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import OrdreFrais from 'app/shared/models/ordre-frais.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdresFraisService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreFrais);
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

          const query = await this.buildGetAll(1);
          type Response = { allOrdreFrais: RelayPage<OrdreFrais> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreFrais)
              resolve(this.asInstancedListCount(res.data.allOrdreFrais));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1);
          type Response = { ordreFrais: OrdreFrais };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordreFrais)
              resolve(new OrdreFrais(res.data.ordreFrais));
          });
        }),
      }),
    });
  }

}
