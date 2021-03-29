import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { CalibreUnifie } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CalibresUnifiesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, CalibreUnifie);
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
          type Response = { allCalibreUnifie: RelayPage<CalibreUnifie> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allCalibreUnifie)
              resolve(this.asInstancedListCount(res.data.allCalibreUnifie));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { calibreUnifie: CalibreUnifie };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { id };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.calibreUnifie)
              resolve(new CalibreUnifie(res.data.calibreUnifie));
          });
        }),
      }),
    });
  }

}
