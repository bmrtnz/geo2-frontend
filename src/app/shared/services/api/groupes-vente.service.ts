import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { GroupeClient } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class GroupesClientService extends ApiService implements APIRead {
    constructor(apollo: Apollo) {
        super(apollo, GroupeClient);
    }

    getDataSource() {
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

                        const query = await this.buildGetAll();
                        type Response = {
                            allGroupeClient: RelayPage<GroupeClient>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allGroupeClient)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allGroupeClient,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne();
                        type Response = { groupeClient: GroupeClient };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.groupeClient)
                                    resolve(
                                        new GroupeClient(res.data.groupeClient),
                                    );
                            },
                        );
                    }),
            }),
        });
    }
}
