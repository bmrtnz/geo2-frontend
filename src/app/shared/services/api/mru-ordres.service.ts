import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { MRUOrdre } from "app/shared/models/mru-ordre.model";
import { StatutKeys } from "app/shared/models/ordre.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { AuthService } from "..";
import { APIRead, ApiService, DistinctInfo, RelayPage } from "../api.service";
import { CurrentCompanyService } from "../current-company.service";

@Injectable({
  providedIn: "root",
})
export class MruOrdresService extends ApiService implements APIRead {
  constructor(
    apollo: Apollo,
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
  ) {
    super(apollo, MRUOrdre);
    this.gqlKeyType = "GeoMRUOrdreKeyInput";
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { MRUOrdre: MRUOrdre };
        const id = key
          ? {
            utilisateur: key.utilisateur || "",
            ordre: key.ordre || "",
          }
          : {};
        const variables = { id };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.MRUOrdre)
            resolve(new MRUOrdre(res.data.MRUOrdre));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        key: ["utilisateur", "ordre"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.take === 1) return;
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            type Response = { allMRUOrdre: RelayPage<MRUOrdre> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "network-only" },
              (res) => {
                if (res.data && res.data.allMRUOrdre)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allMRUOrdre,
                    ),
                  );
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveMRUOrdre: MRUOrdre }>({
      mutation: gql(this.getSaveGraph(columns)),
      variables,
    });
  }

  getSaveGraph(body: Array<string>) {
    return ApiService.buildGraph(
      "mutation",
      [
        {
          name: "saveMRUOrdre",
          body,
          params: [
            {
              name: "mruOrdre",
              value: "mruOrdre",
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: "mruOrdre",
          type: `GeoMRUOrdreInput`,
          isOptionnal: false,
        },
      ],
    );
  }

  saveMRUOrdre(ordre) {
    const mruOrdre = {
      utilisateur: {
        nomUtilisateur: this.authService.currentUser.nomUtilisateur,
      },
      cenCode: ordre.entrepot.code,
      ordreRef: ordre.id,
      ordre: { id: ordre.id },
      entrepot: { id: ordre.entrepot.code },
      societe: { id: this.currentCompanyService.getCompany().id },
      numero: ordre.numero,
    };

    this.save_v2(
      [
        "utilisateur.nomUtilisateur",
        "ordreRef",
        "ordre.id",
        "ordre.numero",
        "ordre.codeClient",
        "ordre.codeAlphaEntrepot",
        "ordre.referenceClient",
        "ordre.dateDepartPrevue",
        "ordre.dateLivraisonPrevue",
        "ordre.transporteur.id",
        "ordre.codeChargement",
        "ordre.statut",
        "ordre.secteurCommercial.id",
        "ordre.entrepot.id",
        "cenCode",
        "ordre.entrepot.code",
        "societe.id",
      ],
      {
        mruOrdre,
      },
    ).subscribe({
      error: (err) => console.log("Echec de la sauvegarde MRU", err),
    });
  }

  getHeadListDataSource(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        key: ["utilisateur", "ordreRef"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group) {

              // Intercepting; GQL; fields, because; they; canno"t be filtered by backend
              if (options.group.find(({ selector }) => selector === "ordre.statut"))
                return resolve({
                  data: StatutKeys.map(key => ({ key })) as DistinctInfo[],
                  totalCount: 0,
                });

              return this.loadDistinctQuery(options, (res) => {
                console.log(this.asListCount(res.data.distinct));
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });
            }

            type Response = { allMRUOrdreHeadList: RelayPage<MRUOrdre> };
            const query = this.buildHeadList(columns);
            const variables = {
              societe: this.currentCompanyService.getCompany().id,
              count: options.take ?? 50
            };

            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "network-only" },
              (res) => {
                if (res.data && res.data.allMRUOrdreHeadList)
                  resolve(res.data.allMRUOrdreHeadList);
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  protected buildHeadList(columns: Array<string> | Set<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: `all${this.model.name}HeadList`,
          body: [...columns],
          params: [
            { name: "societe", value: "societe", isVariable: true },
            { name: "count", value: "count", isVariable: true },
          ],
        },
      ], [
      { name: "societe", type: "String", isOptionnal: false },
      { name: "count", type: "Long", isOptionnal: true },
    ]);
  }
}
