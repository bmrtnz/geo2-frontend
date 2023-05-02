import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import Ordre from "app/shared/models/ordre.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { RegimeTva } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";
import {
  functionBody,
  FunctionResponse,
  FunctionsService,
} from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class RegimesTvaService extends ApiService implements APIRead {
  listRegexp = /.*\.(?:id|description)$/i;

  constructor(apollo: Apollo, private functionsService: FunctionsService) {
    super(apollo, RegimeTva);
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
            type Response = { allRegimeTva: RelayPage<RegimeTva> };
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allRegimeTva)
                resolve(this.asInstancedListCount(res.data.allRegimeTva));
            });
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne(1, this.listRegexp);
            type Response = { regimeTva: RegimeTva };
            const variables = { id: key };
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.regimeTva)
                resolve(new RegimeTva(res.data.regimeTva));
            });
          }),
      }),
    });
  }

  public ofInitRegimeTva(ordRef: Ordre["id"], tvrCode: string) {
    return this.apollo.query<{ ofInitRegimeTva: FunctionResponse }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: "ofInitRegimeTva",
              body: functionBody,
              params: [
                { name: "ordRef", value: "ordRef", isVariable: true },
                { name: "tvrCode", value: "tvrCode", isVariable: true },
              ],
            },
          ],
          [
            { name: "ordRef", type: "String", isOptionnal: false },
            { name: "tvrCode", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: { ordRef, tvrCode },
      fetchPolicy: "network-only",
    });
  }
}
