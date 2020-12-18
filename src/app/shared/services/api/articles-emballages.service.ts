import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { ArticleEmballage } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ArticlesEmballagesService extends ApiService implements APIRead {

  listRegexp = /.\.*(?:id|description)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, ArticleEmballage);
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

          type Response = { allArticleEmballage: RelayPage<ArticleEmballage> };
          const query = await this.buildGetAll(1, this.listRegexp);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allArticleEmballage)
              resolve(this.asInstancedListCount(res.data.allArticleEmballage));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { articleEmballage: ArticleEmballage };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.articleEmballage)
              resolve(new this.model(res.data.articleEmballage));
          });
        }),
      }),
    });
  }

}
