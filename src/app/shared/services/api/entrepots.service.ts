import { Injectable } from "@angular/core";
import { OperationVariables, gql } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Entrepot } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { takeWhile } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class EntrepotsService extends ApiService implements APIRead {
    fieldsFilter = /.*\.(?:id|code|raisonSocial|ville|valide|typeTiers)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Entrepot);
    }

    getOne(id: string) {
        type Response = { entrepot: Entrepot };
        const variables: OperationVariables = { id };
        return this.watchGetOneQuery<Response>({ variables });
    }

    getOne_v2(id: string, columns: Array<string>) {
        return this.apollo
            .query<{ entrepot: Entrepot }>({
                query: gql(this.buildGetOneGraph(columns)),
                variables: { id },
            })
            .pipe(takeWhile((res) => res.loading === false));
    }

    getDataSource_v2(columns: Array<string>) {
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

                        const query = await this.buildGetAll_v2(columns);
                        type Response = { allEntrepot: RelayPage<Entrepot> };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allEntrepot)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allEntrepot,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne_v2(columns);
                        type Response = { entrepot: Entrepot };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.entrepot)
                                    resolve(new Entrepot(res.data.entrepot));
                            },
                        );
                    }),
            }),
        });
    }

    save(variables: OperationVariables) {
        return this.watchSaveQuery({ variables });
    }

    save_v2(columns: Array<string>, variables: OperationVariables) {
        return this.watchSaveQuery_v2({ variables }, columns);
    }
}
