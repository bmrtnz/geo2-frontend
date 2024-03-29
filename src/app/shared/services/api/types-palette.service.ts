import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Article, Secteur, TypePalette } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class TypesPaletteService extends ApiService implements APIRead {
  listRegexp = /.*\.(?:id|description)$/i;

  constructor(apollo: Apollo) {
    super(apollo, TypePalette);
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
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll(1, this.listRegexp);
            type Response = { allTypePalette: RelayPage<TypePalette> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allTypePalette)
                resolve(this.asInstancedListCount(res.data.allTypePalette));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1, this.listRegexp);
            type Response = { typePalette: TypePalette };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.typePalette)
                resolve(new TypePalette(res.data.typePalette));
            });
          }),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { typePalette: TypePalette };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.typePalette)
            resolve(new TypePalette(res.data.typePalette));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = { allTypePalette: RelayPage<TypePalette> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allTypePalette) {
                resolve(this.asInstancedListCount(res.data.allTypePalette));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  fetchNombreColisParPalette(
    typePalette: TypePalette["id"],
    article: Article["id"],
    secteur: Secteur["id"],
  ) {
    return this.apollo.query<{
      fetchNombreColisParPalette: number;
    }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "fetchNombreColisParPalette",
              params: [
                { name: "typePalette", value: "typePalette", isVariable: true },
                { name: "article", value: "article", isVariable: true },
                { name: "secteur", value: "secteur", isVariable: true },
              ],
            },
          ],
          [
            { name: "typePalette", type: "String", isOptionnal: false },
            { name: "article", type: "String", isOptionnal: false },
            { name: "secteur", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: {
        typePalette,
        article,
        secteur,
      },
      fetchPolicy: "network-only",
    })
  }
}
