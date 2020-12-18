import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Categorie } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Categorie);
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
          type Response = { allCategorie: RelayPage<Categorie> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allCategorie)
              resolve(this.asInstancedListCount(res.data.allCategorie));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { categorie: Categorie };
          const id = key ? {id: key.id, espece: key.especeId || ''} : {};
          const variables = { id };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.categorie)
              resolve(new this.model(res.data.categorie));
          });
        }),
      }),
    });
  }

}
