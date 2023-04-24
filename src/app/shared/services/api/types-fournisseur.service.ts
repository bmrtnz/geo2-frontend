import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { TypeFournisseur } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class TypesFournisseurService extends ApiService implements APIRead {
    listRegexp = /.*\.(?:id|description)$/i;

    constructor(apollo: Apollo) {
        super(apollo, TypeFournisseur);
    }

    getDataSource() {
        return new DataSource({
            sort: [{ selector: this.model.getLabelField() as string }],
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
                        type Response = {
                            allTypeFournisseur: RelayPage<TypeFournisseur>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.allTypeFournisseur)
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allTypeFournisseur,
                                        ),
                                    );
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const query = await this.buildGetOne(
                            1,
                            this.listRegexp,
                        );
                        type Response = { typeFournisseur: TypeFournisseur };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.typeFournisseur)
                                    resolve(
                                        new TypeFournisseur(
                                            res.data.typeFournisseur,
                                        ),
                                    );
                            },
                        );
                    }),
            }),
        });
    }
}
