import { Injectable } from '@angular/core';
import { OperationVariables } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Entrepot } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class EntrepotsService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|code|raisonSocial|ville|valide|typeTiers)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Entrepot);
  }

  getOne(id: string) {
    type Response = { entrepot: Entrepot };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getDataSource_v2(columns: Array<string>) {
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

          const query = await this.buildGetAll_v2(columns);
          type Response = { allEntrepot: RelayPage<Entrepot> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allEntrepot)
              resolve(this.asInstancedListCount(res.data.allEntrepot));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne_v2(columns);
          type Response = { entrepot: Entrepot };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.entrepot)
              resolve(new Entrepot(res.data.entrepot));
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }
}
