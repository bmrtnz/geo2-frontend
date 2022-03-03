import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import IdentifiantFournisseur from "app/shared/models/identifiant.fournisseur.model";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class IdentifiantsFournisseurService
    extends ApiService
    implements APIRead {
    listRegexp = /.*\.(?:id|libelle)$/i;

    constructor(apollo: Apollo) {
        super(apollo, IdentifiantFournisseur);
        this.gqlKeyType = "Int";
    }

    getDataSource() {
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

                        const query = await this.buildGetAll(
                            1,
                            this.listRegexp,
                        );
                        type Response = {
                            allIdentifiantFournisseur: RelayPage<IdentifiantFournisseur>;
                        };
                        const variables =
                            this.mapLoadOptionsToVariables(options);

                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (
                                    res.data &&
                                    res.data.allIdentifiantFournisseur
                                )
                                    resolve(
                                        this.asInstancedListCount(
                                            res.data.allIdentifiantFournisseur,
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
                        type Response = {
                            identifiantFournisseur: IdentifiantFournisseur;
                        };
                        const variables = { id: key };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data.identifiantFournisseur)
                                    resolve(
                                        new IdentifiantFournisseur(
                                            res.data.identifiantFournisseur,
                                        ),
                                    );
                            },
                        );
                    }),
            }),
        });
    }
}
