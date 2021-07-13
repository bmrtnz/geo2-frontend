import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import OrdreLogistique from 'app/shared/models/ordre-logistique.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdresLogistiquesService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, OrdreLogistique);
  }

  getDataSource(depth = 1, filter = this.listRegexp) {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(depth, filter);
          type Response = { allOrdreLogistique: RelayPage<OrdreLogistique> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allOrdreLogistique)
              resolve(this.asInstancedListCount(res.data.allOrdreLogistique));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(depth, filter);
          type Response = { ordreLogistique: OrdreLogistique };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.ordreLogistique)
              resolve(new OrdreLogistique(res.data.ordreLogistique));
          });
        }),
      }),
    });
  }

}
