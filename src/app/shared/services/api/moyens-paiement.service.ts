import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { MoyenPaiement } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class MoyensPaiementService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MoyenPaiement);
  }

  getDataSource() {
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

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allMoyenPaiement: RelayPage<MoyenPaiement> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allMoyenPaiement)
              resolve(this.asInstancedListCount(res.data.allMoyenPaiement));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { moyenPaiement: MoyenPaiement };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.moyenPaiement)
              resolve(new this.model(res.data.moyenPaiement));
          });
        }),
      }),
    });
  }

}
