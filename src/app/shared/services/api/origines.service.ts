import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Origine } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class OriginesService extends ApiService implements APIRead {
    listRegexp = /.\.*(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Origine);
        this.gqlKeyType = "GeoProduitWithEspeceIdInput";
    }

    getDataSource() {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() as string }],
            store: this.createCustomStore({
                key: ["id", "especeId"],
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {
                        if (options.group)
                            return this.loadDistinctQuery(options, (res) => {
                                if (res.data && res.data.distinct)
                                    resolve(
                                        this.asListCount(res.data.distinct),
                                    );
                            });

                        const query = await this.buildGetAll(
                            1,
                            this.listRegexp,
                        );
                        type Response = { allOrigine: RelayPage<Origine> };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allOrigine)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allOrigine,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: this.byKey(["id", "description", "espece.id"]),
            }),
        });
    }

    getDistinctDataSource(columns: Array<string>) {
        return new DataSource({
            sort: [{ selector: this.model.getKeyField() as string }],
            store: this.createCustomStore({
                key: ["id", "especeId"],
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {

                        type Response = { allDistinctOrigine: RelayPage<Origine> };
                        const query = await this.buildDistinctQuery(columns.map(c => `edges.node.${c}`));
                        const variables = this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allDistinctOrigine) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allDistinctOrigine,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey(["id", "description", "espece.id"]),
            }),
        });
    }

    private byKey(columns: Array<string>) {
        return key =>
            new Promise(async (resolve) => {
                const id = key
                    ? { id: key.id, espece: key.especeId || "" }
                    : {};
                const variables = { id };
                const res = await this.apollo.query<{ origine: Origine }>({
                    query: gql(this.buildGetOneGraph(columns)),
                    variables,
                }).toPromise();
                resolve(new Origine(res.data.origine));
            });
    }
}
