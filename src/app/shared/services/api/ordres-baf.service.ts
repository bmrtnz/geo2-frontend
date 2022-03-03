import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import OrdreBaf from "app/shared/models/ordre-baf.model";
import { ApiService, APIRead, APICount, RelayPage } from "../api.service";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { first } from "rxjs/operators";

export type CountResponse = { countOrdreBaf: number };

@Injectable({
    providedIn: "root",
})
export class OrdresBafService
    extends ApiService
    implements APIRead, APICount<CountResponse> {
    constructor(apollo: Apollo) {
        super(apollo, OrdreBaf);
    }

    public persistantVariables: Record<string, any> = {};

    setPersisantVariables(params = this.persistantVariables) {
        this.persistantVariables = params;
    }
    getDataSource_v2(columns: Array<string>) {
        return new DataSource({
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise((resolve) => {
                        const query = this.buildQuery(columns);
                        type Response = { fAfficheBaf: Array<OrdreBaf> };

                        const variables = {
                            ...this.persistantVariables,
                            // ...this.mapLoadOptionsToVariables(options)
                        };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.fAfficheBaf) {
                                    resolve(res.data.fAfficheBaf);
                                }
                            },
                        );
                    }),
                byKey: this.byKey(columns),
            }),
        });
    }

    private byKey(columns: Array<string>) {
        return (key) =>
            new Promise(async (resolve) => {
                const query = await this.buildGetOne_v2(columns);
                type Response = { ordreBaf: OrdreBaf };
                const variables = { id: key };
                this.listenQuery<Response>(query, { variables }, (res) => {
                    if (res.data && res.data.ordreBaf)
                        resolve(new OrdreBaf(res.data.ordreBaf));
                });
            });
    }

    count(dxFilter?: any[]) {
        const search = this.mapDXFilterToRSQL(dxFilter);
        return this.watchCountQuery<CountResponse>(search).pipe(first());
    }

    private buildQuery(body: Array<string>) {
        return ApiService.buildGraph(
            "query",
            [
                {
                    name: "fAfficheBaf",
                    body,
                    params: [
                        {
                            name: "societeCode",
                            value: "societeCode",
                            isVariable: true,
                        },
                        {
                            name: "secteurCode",
                            value: "secteurCode",
                            isVariable: true,
                        },
                        {
                            name: "clientCode",
                            value: "clientCode",
                            isVariable: true,
                        },
                        {
                            name: "entrepotCode",
                            value: "entrepotCode",
                            isVariable: true,
                        },
                        { name: "dateMin", value: "dateMin", isVariable: true },
                        { name: "dateMax", value: "dateMax", isVariable: true },
                        {
                            name: "codeAssistante",
                            value: "codeAssistante",
                            isVariable: true,
                        },
                        {
                            name: "codeCommercial",
                            value: "codeCommercial",
                            isVariable: true,
                        },
                    ],
                },
            ],
            [
                { name: "societeCode", type: "String", isOptionnal: false },
                { name: "secteurCode", type: "String", isOptionnal: false },
                { name: "clientCode", type: "String", isOptionnal: true },
                { name: "entrepotCode", type: "String", isOptionnal: true },
                { name: "dateMin", type: "LocalDate", isOptionnal: false },
                { name: "dateMax", type: "LocalDate", isOptionnal: false },
                { name: "codeAssistante", type: "String", isOptionnal: true },
                { name: "codeCommercial", type: "String", isOptionnal: true },
            ],
        );
    }
}
