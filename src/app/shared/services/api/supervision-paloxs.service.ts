import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import SupervisionPalox from "app/shared/models/supervision-palox.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { ApiService } from "../api.service";

@Injectable({
    providedIn: "root",
})
export class SupervisionPaloxsService extends ApiService {
    public persistantVariables: Record<string, any> = {};

    constructor(protected apollo: Apollo) {
        super(apollo, SupervisionPalox);
        this.gqlKeyType = "Int";
    }

    setPersisantVariables(params = this.persistantVariables) {
        this.persistantVariables = params;
    }

    getListDataSource<M extends typeof SupervisionPalox>(
        columns: Array<string>,
        model: M,
    ) {
        return new DataSource({
            store: this.createCustomStore({
                load: (options: LoadOptions) =>
                    new Promise(async (resolve) => {
                        const operation = `all${model.name.ucFirst()}`;
                        const query = await this.buildList(columns, operation);
                        type Response = { [operation: string]: M[] };

                        const variables = this.persistantVariables;
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data[operation]) {
                                    resolve({
                                        data: res.data[operation],
                                        totalCount: res.data[operation].length,
                                    });
                                }
                            },
                        );
                    }),
                byKey: (key) =>
                    new Promise(async (resolve) => {
                        const operation = model.name.ucFirst();
                        const query = await this.buildGetOne_v2(columns);
                        const variables = { id: key };
                        type Response = { [operation: string]: M };
                        this.listenQuery<Response>(
                            query,
                            { variables },
                            (res) => {
                                if (res.data && res.data[operation])
                                    resolve(res.data[operation]);
                            },
                        );
                    }),
            }),
        });
    }

    protected async buildList(columns: Array<string>, operationName?: string) {
        return `
      query ${operationName.ucFirst()}(
        $dateMaxMouvements: LocalDateTime!,
        $codeSociete: String!,
        $codeEntrepot: String,
        $codeCommercial: String
      ) {
        ${operationName}(
          dateMaxMouvements: $dateMaxMouvements
          codeSociete: $codeSociete
          codeEntrepot: $codeEntrepot
          codeCommercial: $codeCommercial
        ) {
          ${await this.model.getGQLObservable(columns).toPromise()}
        }
      }
    `;
    }
}
