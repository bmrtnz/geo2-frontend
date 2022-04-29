import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Flux } from "app/shared/models";
import Envois from "app/shared/models/envois.model";
import Ordre from "app/shared/models/ordre.model";
import TracabiliteLigne from "app/shared/models/tracabilite-ligne.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { take } from "rxjs/operators";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class EnvoisService extends ApiService implements APIRead {
    // listRegexp = /.*\.(?:id|libelle)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Envois);
    }

    getDataSource() {
        return new DataSource({
            // sort: [
            //   { selector: this.model.getLabelField() }
            // ],
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

                        // const query = await this.buildGetAll(1, this.listRegexp);
                        const query = await this.buildGetAll(1);
                        type Response = { allEnvois: RelayPage<Envois> };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables, fetchPolicy: "no-cache" },
                            (res) => {
                                if (res.data && res.data.allEnvois)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allEnvois,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        // const query = await this.buildGetOne(1, this.listRegexp);
                        const query = await this.buildGetOne(1);
                        type Response = { envois: Envois };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.envois)
                                    resolve(new Envois(res.data.envois));
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
                type Response = { envois: Envois };
                const variables = { id: key };
                this.listenQuery<Response>(query, { variables }, (res) => {
                    if (res.data && res.data.envois)
                        resolve(new Envois(res.data.envois));
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

                        type Response = { allEnvois: RelayPage<Envois> };
                        const query = await this.buildGetAll_v2(columns);
                        const variables =
                            this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables, fetchPolicy: "no-cache", },
                            (res) => {
                                if (res.data && res.data.allEnvois) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allEnvois,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey(columns),
                update: (key, values) => {
                    const variables = { ordreLigne: { id: key, ...values } };
                    return this.watchSaveQuery({ variables }).toPromise();
                },
            }),
        });
    }

    getList(search: string, columns: Array<string>) {
        return this.apollo
            .query<{ allEnvoisList: Envois[] }>({
                query: gql(this.buildGetListGraph(columns)),
                variables: { search },
            });
    }

    saveAll(allEnvois: Partial<Envois>[], columns: Set<string>) {
        return this.apollo.mutate({
            mutation: gql(this.buildSaveAllGraph([...columns])),
            variables: { allEnvois },
        }).pipe(take(1));
    }

    public countByOrdreAndFlux(
        ordre: { id: string } & Partial<Ordre>,
        flux: { id: string } & Partial<Flux>,
    ) {
        return this.apollo.query<{ countByOrdreAndFlux: number }>({
            query: gql(ApiService.buildGraph("query", [
                {
                    name: "countByOrdreAndFlux",
                    params: [
                        { name: "ordre", value: "ordre", isVariable: true },
                        { name: "flux", value: "flux", isVariable: true },
                    ],
                },
            ], [
                { name: "ordre", type: "GeoOrdreInput", isOptionnal: false },
                { name: "flux", type: "GeoFluxInput", isOptionnal: false },
            ])),
            variables: { ordre, flux },
            fetchPolicy: "network-only",
        });
    }

    public countByOrdreFluxTraite(
        ordre: { id: string } & Partial<Ordre>,
        flux: { id: string } & Partial<Flux>,
        traite: Set<string>,
    ) {
        return this.apollo.query<{ countByOrdreFluxTraite: number }>({
            query: gql(ApiService.buildGraph("query", [
                {
                    name: "countByOrdreFluxTraite",
                    params: [
                        { name: "ordre", value: "ordre", isVariable: true },
                        { name: "flux", value: "flux", isVariable: true },
                        { name: "traite", value: "traite", isVariable: true },
                    ],
                },
            ], [
                { name: "ordre", type: "GeoOrdreInput", isOptionnal: false },
                { name: "flux", type: "GeoFluxInput", isOptionnal: false },
                { name: "traite", type: "[Char]", isOptionnal: false },
            ])),
            variables: { ordre, flux, traite: [...traite] },
            fetchPolicy: "network-only",
        });
    }

}
