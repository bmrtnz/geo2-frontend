import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Espece } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class EspecesService extends ApiService implements APIRead {
    listRegexp = /.\.*(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Espece);
    }

    getDataSource() {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() }],
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

                        const query = await this.buildGetAll(
                            1,
                            this.listRegexp,
                        );
                        type Response = { allEspece: RelayPage<Espece> };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allEspece)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allEspece,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: this.byKey(["id", "description"]),
            }),
        });
    }

    getDistinctDataSource(columns: Array<string>) {
        return new DataSource({
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {

                        type Response = { allDistinctEspece: RelayPage<Espece> };
                        const query = await this.buildDistinctQuery(columns.map(c => `edges.node.${c}`));
                        const variables = this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allDistinctEspece) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allDistinctEspece,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey(columns),
            }),
        });
    }

    private byKey(columns: Array<string>) {
        return id =>
            new Promise(async (resolve) => {
                const variables = { id };
                const res = await this.apollo.query<{ espece: Espece }>({
                    query: gql(this.buildGetOneGraph(columns)),
                    variables,
                }).toPromise();
                resolve(new Espece(res.data.espece));
            });
    }
}
