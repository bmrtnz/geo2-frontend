import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Cirage } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CiragesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Cirage);
    this.gqlKeyType = 'GeoProduitWithEspeceIdInput';
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        key: ['id', 'especeId'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allCirage: RelayPage<Cirage> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allCirage)
              resolve(this.asInstancedListCount(res.data.allCirage));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { cirage: Cirage };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { id };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.cirage)
              resolve(new this.model(res.data.cirage));
          });
        }),
      }),
    });
  }

}
