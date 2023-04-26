import { Injectable } from "@angular/core";
import { gql, OperationVariables } from "@apollo/client/core";
import { Apollo } from "apollo-angular";
import Utilisateur from "app/shared/models/utilisateur.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { GridConfig, Societe } from "../../models";
import { APIPersist, APIRead, ApiService, RelayPage } from "../api.service";
import { Grid } from "../grid-configurator.service";

@Injectable({
  providedIn: "root",
})
export class GridsConfigsService
  extends ApiService
  implements APIRead, APIPersist
{
  fieldsFilter = /.*/i;

  constructor(apollo: Apollo) {
    super(apollo, GridConfig);
    this.gqlKeyType = "GeoGridConfigInput";
  }

  static getCacheID(data: Partial<GridConfig>) {
    return `GeoGridConfig:${data.grid}-${data.utilisateur.nomUtilisateur}-${data.societe.id}`;
  }

  private getOneGraph(body: Array<string>) {
    return ApiService.buildGraph(
      "query",
      [
        {
          name: this.model.name.lcFirst(),
          body,
          params: [
            {
              name: "id",
              value: "id",
              isVariable: true,
            },
          ],
        },
      ],
      [
        {
          name: "id",
          type: "GeoGridConfigKeyInput",
          isOptionnal: false,
        },
      ]
    );
  }

  fetchUserGrid(user: Utilisateur, grid: Grid, societe: Societe) {
    return this.apollo
      .watchQuery<{ gridConfig: GridConfig }>({
        query: gql(
          this.getOneGraph([
            "grid",
            "config",
            "utilisateur.nomUtilisateur",
            "societe.id",
          ])
        ),
        fetchPolicy: "cache-and-network",
        variables: {
          id: {
            utilisateur: user.nomUtilisateur,
            grid,
            societe: societe.id,
          },
        },
      })
      .valueChanges.pipe(takeWhile((res) => res.loading, true));
  }

  getDataSource() {
    return new DataSource({
      store: this.createCustomStore({
        key: ["utilisateur", "grid", "societe"],
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(1, this.fieldsFilter);
            type Response = {
              allGridConfig: RelayPage<GridConfig>;
            };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allGridConfig)
                resolve(this.asInstancedListCount(res.data.allGridConfig));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne();
            type Response = { gridConfig: GridConfig };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables, fetchPolicy: "cache-and-network" },
              (res) => {
                if (res.data && res.data.gridConfig)
                  resolve(new GridConfig(res.data.gridConfig));
              }
            );
          }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables, fetchPolicy: "no-cache" });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveGridConfig: GridConfig }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
      update: (cache) => {
        cache.modify({
          id: GridsConfigsService.getCacheID(variables.gridConfig),
          fields: {
            config: (config) => config, // ¯\_(ツ)_/¯
          },
        });
      },
    });
  }
}
