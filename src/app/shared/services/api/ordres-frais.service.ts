import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import OrdreFrais from "app/shared/models/ordre-frais.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class OrdresFraisService extends ApiService implements APIRead {
    constructor(apollo: Apollo) {
        super(apollo, OrdreFrais);
    }

    getDataSource(depth = 1, filter?: RegExp) {
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

                        const query = await this.buildGetAll(depth, filter);
                        type Response = {
                            allOrdreFrais: RelayPage<OrdreFrais>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allOrdreFrais)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allOrdreFrais,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne(depth, filter);
                        type Response = { ordreFrais: OrdreFrais };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.ordreFrais)
                                    resolve(
                                        new OrdreFrais(res.data.ordreFrais),
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
                type Response = { ordreFrais: OrdreFrais };
                const variables = { id: key };
                this.listenQuery<Response>(query, { variables }, (res) => {
                    if (res.data && res.data.ordreFrais)
                        resolve(new OrdreFrais(res.data.ordreFrais));
                });
            });
    }

    getDataSource_v2(columns: Array<string>) {
        return new DataSource({
            sort: [{ selector: this.model.getKeyField() }],
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
                            allOrdreFrais: RelayPage<OrdreFrais>;
                        };
                        const query = await this.buildGetAll_v2(columns);
                        const variables =
                            this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            {
                                variables,
                                fetchPolicy: "network-only" // to work with editable dx-grid
                            },
                            (res) => {
                                if (res.data && res.data.allOrdreFrais) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allOrdreFrais,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey(columns),
                insert: (values) => {
                    const variables = { ordreFrais: values };
                    return this.watchSaveQuery({ variables }).toPromise();
                },
                update: (key, values) => {
                    const variables = { ordreFrais: { id: key, ...values } };
                    return this.watchSaveQuery({ variables }).toPromise();
                },
                remove: (key) => {
                    const variables = { id: key };
                    return this.watchDeleteQuery({ variables }).toPromise();
                },
            }),
        });
    }
}
