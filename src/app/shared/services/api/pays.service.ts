import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { first, takeWhile } from "rxjs/operators";
import { Pays } from "../../models";
import { APICount, APIRead, ApiService, RelayPage } from "../api.service";

export enum Operation {
    All = "allPays",
    AllDistinct = "allDistinctPays",
}

export type CountResponse = { countPays: number };

@Injectable({
    providedIn: "root",
})
export class PaysService
    extends ApiService
    implements APIRead, APICount<CountResponse> {
    fieldsFilter = /.*\.(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Pays);
    }

    getDataSource(
        depth = 1,
        filter = this.fieldsFilter,
        operation = Operation.All,
    ) {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() }],
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {
                        const operationName = operation.valueOf();
                        type Response = {
                            [operationName: string]: RelayPage<Pays>;
                        };

                        if (options.group)
                            return this.loadDistinctQuery(options, (res) => {
                                if (res.data && res.data.distinct)
                                    resolve(
                                        this.asListCount(res.data.distinct),
                                    );
                            });

                        const query = await this.buildGetAll(
                            depth,
                            filter,
                            operationName,
                        );
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data[operationName])
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data[operationName],
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne(depth, filter);
                        type Response = { pays: Pays };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.pays)
                                    resolve(new Pays(res.data.pays));
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
                type Response = { pays: Pays };
                const variables = { id: key };
                this.listenQuery<Response>(query, { variables }, (res) => {
                    if (res.data && res.data.pays)
                        resolve(new Pays(res.data.pays));
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

                        type Response = { allPays: RelayPage<Pays> };
                        const query = await this.buildGetAll_v2(columns);
                        const variables =
                            this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allPays) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allPays,
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

    public getDistinctList(columns: Array<string>, search?: string) {
        return this.apollo
            .query<{ allPaysList: Pays[] }>({
                query: gql(this.buildGetDistinctListGraph(columns)),
                variables: { search },
            })
            .pipe(takeWhile((res) => !res.loading));
    }

    protected buildGetDistinctListGraph(body: Array<string>) {
        return ApiService.buildGraph(
            "query",
            [
                {
                    name: `allPaysList`,
                    body,
                    params: [{ name: "search", value: "search", isVariable: true }],
                },
            ],
            [{ name: "search", type: "String", isOptionnal: true }],
        );
    }

    getDistinctListDataSource(columns: Array<string>) {
        return new DataSource({
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {
                        const { search } = this.mapLoadOptionsToVariables(options);
                        const res = await this.getDistinctList(columns, search).toPromise();
                        resolve({
                            data: res.data.allPaysList,
                            totalCount: res.data.allPaysList.length,
                        });
                    }),
                byKey: this.byKey(columns),
            }),
        });
    }

    count(dxFilter?: any[]) {
        const search = this.mapDXFilterToRSQL(dxFilter);
        return this.watchCountQuery<CountResponse>(search).pipe(first());
    }
}
