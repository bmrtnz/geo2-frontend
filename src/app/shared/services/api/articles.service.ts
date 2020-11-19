import { Injectable } from '@angular/core';
import { ApiService, APIRead, RelayPageVariables, RelayPage } from '../api.service';
import { Apollo } from 'apollo-angular';
import { Article } from '../../models';
import { OperationVariables, WatchQueryOptions, MutationOptions } from 'apollo-client';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ArticlesService extends ApiService implements APIRead {

  /* tslint:disable-next-line max-line-length */
  fieldsFilter = /.\.*(?:id|description|espece|variete|blueWhaleStock|type|modeCulture|valide|commentaire|userModification|dateModification)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Article);
  }

  async getOne(id: string) {
    const query = await this.buildGetOne(3);
    type Response = { article: Article };
    const variables: OperationVariables = { id };
    return this.query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: this.model.getLabelField() }
      ],
      store: this.createCustomStore({
        load: async (options: LoadOptions) => {

          if (options.group)
            return this.getDistinct(options).toPromise();

          const query = await this.buildGetAll(2);
          type Response = { allArticle: RelayPage<Article> };
          const variables = this.mapLoadOptionsToVariables(options);
          return this.
          query<Response>(query, { variables, fetchPolicy: 'no-cache' } as WatchQueryOptions<RelayPageVariables>)
          .pipe(
            map( res => this.asListCount(res.data.allArticle)),
            take(1),
          )
          .toPromise();
        },
        byKey: async (key) => {
          const query = await this.buildGetOne(1);
          type Response = { article: Article };
          const variables = { id: key };
          return this.
          query<Response>(query, { variables } as WatchQueryOptions<any>)
          .pipe(
            map( res => res.data.article),
            take(1),
          )
          .toPromise();
        },
      }),
    });
  }

  async save(variables: OperationVariables & { clone: boolean }) {
    const mutation = await this.buildSaveWithClone(2, this.fieldsFilter);
    return this.mutate(mutation, { variables } as any);
  }

  protected async buildSaveWithClone(depth?: number, filter?: RegExp) {
    return `
      mutation SaveArticle($article: GeoArticleInput!,$clone: Boolean = false) {
        saveArticle(article: $article,clone: $clone) {
          ${ await this.model.getGQLFields(depth, filter).toPromise() }
        }
      }
    `;
  }

}
