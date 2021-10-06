import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Personne } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonnesService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|nomUtilisateur)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Personne);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: 'nomUtilisateur' }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allPersonne: RelayPage<Personne> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allPersonne)
              resolve(this.asInstancedListCount(res.data.allPersonne));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { personne: Personne };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.personne)
              resolve(new Personne(res.data.personne));
          });
        }),
      }),
    });
  }

}
