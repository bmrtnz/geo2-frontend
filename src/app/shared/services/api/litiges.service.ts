import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import Litige from 'app/shared/models/litige.model';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class LitigesService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|libelle)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Litige);
  }

  getDataSource() {
    return new DataSource({
      // sort: [
      //   { selector: this.model.getLabelField() }
      // ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          // const query = await this.buildGetAll(1, this.listRegexp);
          const query = await this.buildGetAll(1);
          type Response = { allLitige: RelayPage<Litige> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allLitige)
              resolve(this.asInstancedListCount(res.data.allLitige));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          // const query = await this.buildGetOne(1, this.listRegexp);
          const query = await this.buildGetOne(1);
          type Response = { litige: Litige };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.litige)
              resolve(new Litige(res.data.litige));
          });
        }),
      }),
    });
  }

}
