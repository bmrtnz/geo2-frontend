import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Societe } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class SocietesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Societe);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: 'raisonSocial' }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll();
          type Response = { allSociete: RelayPage<Societe> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allSociete)
              resolve(this.asInstancedListCount(res.data.allSociete));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { societe: Societe };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.societe)
              resolve(new Societe(res.data.societe));
          });
        }),
      }),
    });
  }

}
