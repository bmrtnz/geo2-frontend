import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { GroupeEmballage } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class GroupesEmballageService extends ApiService implements APIRead {
    listRegexp = /.\.*(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, GroupeEmballage);
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
                        type Response = {
                            allGroupeEmballage: RelayPage<GroupeEmballage>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allGroupeEmballage)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allGroupeEmballage,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne();
                        type Response = { groupeEmballage: GroupeEmballage };
                        const id = key
                            ? { id: key.id, espece: key.especeId || "" }
                            : {};
                        const variables = { id };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.groupeEmballage)
                                    resolve(
                                        new GroupeEmballage(
                                            res.data.groupeEmballage,
                                        ),
                                    );
                            },
                        );
                    }),
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

                        type Response = { allDistinctGroupeEmballage: RelayPage<GroupeEmballage> };
                        const query = await this.buildDistinctQuery(columns.map(c => `edges.node.${c}`));
                        const variables = this.mapLoadOptionsToVariables(options);
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allDistinctGroupeEmballage) {
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allDistinctGroupeEmballage,
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
                const res = await this.apollo.query<{ groupeEmballage: GroupeEmballage }>({
                    query: gql(this.buildGetOneGraph(columns)),
                    variables,
                }).toPromise();
                if (res?.data?.groupeEmballage) resolve(new GroupeEmballage(res.data.groupeEmballage));
            });
    }
}
