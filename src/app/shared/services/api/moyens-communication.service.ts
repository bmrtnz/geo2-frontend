import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { MoyenCommunication } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class MoyenCommunicationService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, MoyenCommunication);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: 'description' }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll();
          type Response = { allMoyenCommunication: RelayPage<MoyenCommunication> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allMoyenCommunication)
              resolve(this.asInstancedListCount(res.data.allMoyenCommunication));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { moyenCommunication: MoyenCommunication };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.moyenCommunication)
              resolve(new MoyenCommunication(res.data.moyenCommunication));
          });
        }),
      }),
    });
  }

}

