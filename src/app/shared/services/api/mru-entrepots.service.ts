import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import MRUEntrepot from "app/shared/models/mru-entrepot.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { AuthService } from "app/shared/services";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { CurrentCompanyService } from "../current-company.service";

@Injectable({
  providedIn: "root",
})
export class MruEntrepotsService extends ApiService implements APIRead {
  constructor(
    apollo: Apollo,
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
  ) {
    super(apollo, MRUEntrepot);
    this.gqlKeyType = "GeoMRUEntrepotKeyInput";
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ["utilisateur", "entrepot"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            type Response = {
              allMRUEntrepot: RelayPage<MRUEntrepot>;
            };
            const query = await this.buildGetAll(2);
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allMRUEntrepot)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allMRUEntrepot,
                    ),
                  );
              },
            );
          }),
        byKey: this.byKey,
      }),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveMRUEntrepot: MRUEntrepot }>({
      mutation: gql(this.getSaveGraph(columns)),
      variables,
    });
  }

  getSaveGraph(body: Array<string>) {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: "saveMRUEntrepot",
          body,
          params: [
            {
              name: "mruEntrepot",
              value: "mruEntrepot",
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: "mruEntrepot",
          type: `GeoMRUEntrepotInput`,
          isOptionnal: false,
        },
      ],
    );
  }

  saveMRUEntrepot(entrepot) {
    const mruEntrepot = {
      utilisateur: {
        nomUtilisateur: this.authService.currentUser.nomUtilisateur,
      },
      codeEntrepot: entrepot.code,
      entrepot: { id: entrepot.id },
      societe: { id: this.currentCompanyService.getCompany().id }
    };

    this.save_v2(
      [
        "entrepot.id",
        "utilisateur.nomUtilisateur",
      ],
      {
        mruEntrepot,
      },
    ).subscribe({
      error: (err) => console.log("Echec de la sauvegarde MRU Entrepot", err),
    });
  }

  // private byKey(key) {
  //   return new Promise(async (resolve) => {
  //     const query = await this.buildGetOne(2);
  //     type Response = { MRUEntrepot: MRUEntrepot };
  //     const id = key ? {
  //       utilisateur: key.utilisateur || '',
  //       ordre: key.ordre || '',
  //     } : {};
  //     const variables = { id };
  //     this.listenQuery<Response>(query, { variables }, res => {
  //       if (res.data && res.data.MRUEntrepot)
  //         resolve(new MRUEntrepot(res.data.MRUEntrepot));
  //     });
  //   });
  // }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { MRUEntrepot: MRUEntrepot };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.MRUEntrepot)
            resolve(new MRUEntrepot(res.data.MRUEntrepot));
        });
      });
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

            type Response = {
              allMRUEntrepot: RelayPage<MRUEntrepot>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "no-cache", },
              (res) => {
                if (res.data && res.data.allMRUEntrepot)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allMRUEntrepot,
                    ),
                  );
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  deleteOne(entrepotId: string) {
    return this.apollo.mutate({
      mutation: gql(ApiService.buildGraph("mutation", [{
        name: "deleteOneMRUEntrepot",
        params: [{ name: "entrepotId", value: "entrepotId", isVariable: true }],
      }], [
        { name: "entrepotId", type: "String", isOptionnal: false },
      ])),
      variables: { entrepotId },
    });
  }

  deleteAll() {
    return this.apollo.mutate({
      mutation: gql(ApiService.buildGraph("mutation", [{
        name: "deleteAllMRUEntrepot",
      }])),
    });
  }
}
