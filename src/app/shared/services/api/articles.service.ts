import { Injectable } from '@angular/core';
import { gql, MutationOptions, OperationVariables, WatchQueryOptions } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { from } from 'rxjs';
import { mergeMap, take, takeUntil } from 'rxjs/operators';
import { Article } from '../../models';
import { APIRead, ApiService, RelayPage } from '../api.service';

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

  getOne(id: string) {
    type Response = { article: Article };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({variables}, 3);
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

          type Response = { allArticle: RelayPage<Article> };
          const query = await this.buildGetAll(3);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allArticle)
              resolve(this.asInstancedListCount(res.data.allArticle));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1);
          type Response = { article: Article };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.article)
              resolve(new Article(res.data.article));
          });
        }),
      }),
    });
  }

  getFilterDatasource(selector: string) {
    const dt = new DataSource({
      store: this.createCustomStore({
        key: this.model.getKeyField(),
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });
          const [value] = options.filter.slice(-1);
          options.filter = [selector, '=', value];
          return this
            .loadDistinctQuery({ ...options, group: { selector } }, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });
        }),
      }),
    });
    dt.group({ selector });
    return dt;
  }

  save(variables: OperationVariables & { clone: boolean }) {
    return from(this.buildSaveWithClone(2, this.fieldsFilter))
    .pipe(
      takeUntil(this.destroy),
      mergeMap( query => this.apollo.mutate({
        mutation: gql(query),
        variables,
      } as MutationOptions)),
      take(1),
    );
  }

  protected async buildSaveWithClone(depth?: number, filter?: RegExp) {
    return `
      mutation SaveArticle($article: GeoArticleInput!,$clone: Boolean = false) {
        saveArticle(article: $article,clone: $clone) {
          ${await this.model.getGQLFields(depth, filter).toPromise()}
        }
      }
    `;
  }

}
