import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class OrdresLogistiquesService extends ApiService implements APIRead {
    listRegexp = /.*\.(?:id)$/i;

    constructor(apollo: Apollo) {
        super(apollo, OrdreLogistique);
    }

    getDataSource(depth = 1, filter = this.listRegexp) {
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

                        // const query = await this.buildGetAll(depth, filter);
                        const query = await this.buildGetAll(depth);
                        type Response = {
                            allOrdreLogistique: RelayPage<OrdreLogistique>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allOrdreLogistique)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allOrdreLogistique,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        // const query = await this.buildGetOne(depth, filter);
                        const query = await this.buildGetOne(depth);
                        type Response = { ordreLogistique: OrdreLogistique };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.ordreLogistique)
                                    resolve(
                                        new OrdreLogistique(
                                            res.data.ordreLogistique,
                                        ),
                                    );
                            },
                        );
                    }),
            }),
        });
    }

    private byKey(columns: Array<string>) {
        return (key) =>
            new Promise(async (resolve) => {
                const query = await this.buildGetOne_v2(columns);
                type Response = { ordreLogistique: OrdreLogistique };
                const variables = { id: key };
                this.listenQuery<Response>(query, { variables }, (res) => {
                    if (res.data && res.data.ordreLogistique)
                        resolve(new OrdreLogistique(res.data.ordreLogistique));
                });
            });
    }

    getDataSource_v2(columns: Array<string>) {
        return new DataSource({
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
                            allOrdreLogistique: RelayPage<OrdreLogistique>;
                        };
                        const query = await this.buildGetAll_v2(columns);
                        const variables =
                            this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            {
                                variables,
                                fetchPolicy: "network-only", // to work with editable dx-grid
                            },
                            (res) => {
                                if (res.data && res.data.allOrdreLogistique) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allOrdreLogistique,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey(columns),
                insert: (values) => {
                    const variables = { ordreLogistique: values };
                    return this.watchSaveQuery({ variables }).toPromise();
                },
                update: (key, values) => {
                    const variables = { ordreLogistique: { id: key, ...values } };
                    return this.watchSaveQuery({ variables }).toPromise();
                },
                remove: (key) => {
                    const variables = { id: key };
                    return this.watchDeleteQuery({ variables }).toPromise();
                },
            }),
        });
    }

    count(search?: string) {
        return this.apollo.query<{ countOrdreLogistique: number }>({
            query: gql(this.buildCountGraph()),
            variables: { search },
        });
    }
}
