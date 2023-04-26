import { Injectable } from "@angular/core";
import { gql, MutationOptions, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import { Article } from "app/shared/models";
import {
  APIRead,
  ApiService,
  RelayPage,
} from "app/shared/services/api.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { from } from "rxjs";
import { mergeMap, take, takeUntil } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ArticlesService extends ApiService implements APIRead {
  /* eslint-disable-next-line  max-len */
  fieldsFilter =
    /.\.*(?:id|description|espece|variete|blueWhaleStock|type|modeCulture|valide|commentaire|userModification|dateModification|preSaisie)$/i;

  constructor(apollo: Apollo) {
    super(apollo, Article);
  }

  getOne(id: string) {
    type Response = { article: Article };
    const variables: OperationVariables = { id };
    return this.watchGetOneQuery<Response>({ variables }, 3);
  }

  getDataSource_v2(columns: Array<string>, fetchPol?) {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = { allArticle: RelayPage<Article> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: fetchPol ? fetchPol : "cache-first" },
              (res) => {
                if (res.data && res.data.allArticle)
                  resolve(this.asInstancedListCount(res.data.allArticle));
              }
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { article: Article };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
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
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });
            if (options.filter) {
              const [value] = options.filter.slice(-1);
              options.filter = [selector, "=", value];
            }
            return this.loadDistinctQuery(
              { ...options, group: { selector } },
              (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              }
            );
          }),
      }),
    });
    dt.group({ selector });
    return dt;
  }

  save(variables: OperationVariables & { clone: boolean }) {
    return from(this.buildSaveWithClone(2, this.fieldsFilter)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          variables,
        } as MutationOptions)
      ),
      take(1)
    );
  }

  save_v2(
    columns: Array<string>,
    variables: OperationVariables & { clone: boolean }
  ) {
    return from(this.buildSaveWithClone_v2(columns)).pipe(
      takeUntil(this.destroy),
      mergeMap((query) =>
        this.apollo.mutate({
          mutation: gql(query),
          variables,
        } as MutationOptions)
      ),
      take(1)
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

  protected async buildSaveWithClone_v2(columns: Array<string>) {
    return `
      mutation SaveArticle($article: GeoArticleInput!,$clone: Boolean = false) {
        saveArticle(article: $article,clone: $clone) {
          ${await this.model.getGQLObservable(columns).toPromise()}
        }
      }
    `;
  }

  public getDistinctEntityDatasource(
    fieldName,
    descriptionField?,
    searchExpr?,
    fetchPolicy?
  ) {
    return this.getDistinctDatasource(
      "GeoArticle",
      fieldName,
      descriptionField,
      searchExpr,
      fetchPolicy
    );
  }

  concatArtDescript(article) {
    let desc = "  " + article.id + " " + article.matierePremiere.variete.id;
    desc += " cat " + article.cahierDesCharge.categorie.id;
    if (article.normalisation.calibreMarquage.id) {
      desc += " cal " + article.normalisation.calibreMarquage.id;
    }
    if (article.emballage.emballage) {
      desc += " " + article.emballage.emballage.id;
    }
    if (article.emballage.poidsNetClient > 0) {
      desc += " " + article.emballage.poidsNetClient + "kg";
    }
    if (!article.emballage.prepese) desc += " NT";
    if (article.matierePremiere.modeCulture.id !== 0) {
      desc += " " + article.matierePremiere.modeCulture.description;
    }
    if (!["F", "-"].includes(article.matierePremiere.origine.id)) {
      desc += " " + article.matierePremiere.origine.description;
    }
    const isBio = article.matierePremiere?.modeCulture?.description
      ?.toLowerCase()
      .includes("bio");
    if (!article.id) desc = "Erreur article (id)";
    return { concatDesc: desc, bio: isBio };
  }

  concatArtDescriptAbregee(article) {
    let desc =
      "  " +
      article.id +
      " " +
      (article.description ? article.description : "");
    const isBio = article.matierePremiere?.modeCulture?.description
      ?.toLowerCase()
      .includes("bio");
    if (!article.id) desc = "Erreur article (id)";
    return { concatDesc: desc, bio: isBio };
  }
}
