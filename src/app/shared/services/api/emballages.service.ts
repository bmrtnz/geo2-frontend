import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Emballage } from "../../models/emballage.model";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class EmballagesService extends ApiService implements APIRead {
    listRegexp = /.\.*(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, Emballage);
        this.gqlKeyType = "GeoProduitWithEspeceIdInput";
    }

    getDataSource() {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() }],
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
                        type Response = { allEmballage: RelayPage<Emballage> };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allEmballage)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allEmballage,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: this.byKey,
            }),
        });
    }

    getDistinctDataSource(columns: Array<string>) {
        return new DataSource({
            sort: [{ selector: this.model.getKeyField() }],
            store: this.createCustomStore({
                key: ["id", "especeId"],
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {

                        type Response = { allDistinctEmballage: RelayPage<Emballage> };
                        const query = await this.buildDistinctQuery(columns.map(c => `edges.node.${c}`));
                        const variables = this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allDistinctEmballage) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allDistinctEmballage,
                                        ),
                                    );
                                }
                            },
                        );
                    }),
                byKey: this.byKey,
            }),
        });
    }

    byKey(key) {
        return new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { emballage: Emballage };
            const id = key
                ? { id: key.id, espece: key.especeId || "" }
                : {};
            const variables = { id };
            this.listenQuery<Response>(
                query,
                { variables },
                (res) => {
                    if (res.data && res.data.emballage)
                        resolve(new Emballage(res.data.emballage));
                },
            );
        });
    }
}
