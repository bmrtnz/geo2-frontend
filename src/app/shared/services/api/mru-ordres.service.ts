import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { MRUOrdre } from 'app/shared/models/mru-ordre.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class MruOrdresService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MRUOrdre);
    this.gqlKeyType = 'GeoMRUOrdreKeyInput';
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ['utilisateur', 'ordre'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          type Response = { allMRUOrdre: RelayPage<MRUOrdre> };
          const query = await this.buildGetAll(2);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allMRUOrdre)
              resolve(this.asInstancedListCount(res.data.allMRUOrdre));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(2);
          type Response = { MRUOrdre: MRUOrdre };
          const id = key ? {
            utilisateur: key.utilisateur || '',
            espece: key.especeId || '',
          } : {};
          const variables = { id };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.MRUOrdre)
              resolve(new this.model(res.data.MRUOrdre));
          });
        }),
      }),
    });
  }

}
