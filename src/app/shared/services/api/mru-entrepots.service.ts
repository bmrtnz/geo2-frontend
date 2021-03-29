import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import MRUEntrepot from 'app/shared/models/mru-entrepot.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class MruEntrepotsService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MRUEntrepot);
    this.gqlKeyType = 'GeoMRUEntrepotKeyInput';
  }

  private byKey(key) {
    return new Promise(async (resolve) => {
      const query = await this.buildGetOne(2);
      type Response = { MRUEntrepot: MRUEntrepot };
      const id = key ? {
        utilisateur: key.utilisateur || '',
        ordre: key.ordre || '',
      } : {};
      const variables = { id };
      this.listenQuery<Response>(query, { variables }, res => {
        if (res.data && res.data.MRUEntrepot)
          resolve(new MRUEntrepot(res.data.MRUEntrepot));
      });
    });
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ['utilisateur', 'entrepot'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allMRUEntrepot: RelayPage<MRUEntrepot> };
          const query = await this.buildGetAll(2);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allMRUEntrepot)
              resolve(this.asInstancedListCount(res.data.allMRUEntrepot));
          });
        }),
        byKey: this.byKey,
      }),
    });
  }

}
