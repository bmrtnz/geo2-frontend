import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Article } from "../../models";
import { ArticleMatierePremiere } from "../../models/article-matiere-premiere.model";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class ArticlesMatieresPremieresService
    extends ApiService
    implements APIRead {
    constructor(apollo: Apollo) {
        super(apollo, Article);
    }

    getDataSource() {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() as string }],
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {
                        if (options.group)
                            return this.loadDistinctQuery(options, (res) => {
                                if (res.data && res.data.distinct)
                                    resolve(
                                        this.asListCount(res.data.distinct),
                                    );
                            });

                        type Response = {
                            allArticleMatierePremiere: RelayPage<ArticleMatierePremiere>;
                        };
                        const query = await this.buildGetAll();
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (
                                    res.data &&
                                    res.data.allArticleMatierePremiere
                                )
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allArticleMatierePremiere,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne();
                        type Response = {
                            articleMatierePremiere: ArticleMatierePremiere;
                        };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.articleMatierePremiere)
                                    resolve(
                                        new ArticleMatierePremiere(
                                            res.data.articleMatierePremiere,
                                        ),
                                    );
                            },
                        );
                    }),
            }),
        });
    }
}
