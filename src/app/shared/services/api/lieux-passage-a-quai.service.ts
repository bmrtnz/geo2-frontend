import { Apollo } from "apollo-angular";
import { OperationVariables } from "@apollo/client/core";
import { Injectable } from "@angular/core";
import { LieuPassageAQuai } from "../../models";
import { ApiService, APIRead, RelayPage } from "../api.service";

import { LoadOptions } from "devextreme/data/load_options";
import DataSource from "devextreme/data/data_source";

@Injectable({
  providedIn: "root",
})
export class LieuxPassageAQuaiService extends ApiService implements APIRead {
  fieldsFilter =
    /.*\.(?:id|raisonSocial|description|ville|codePostal|adresse1|valide|typeTiers)$/i;

  constructor(apollo: Apollo) {
    super(apollo, LieuPassageAQuai);
  }

  getOne(id: string) {
    const variables: OperationVariables = { id };
    type Response = { lieuPassageAQuai: LieuPassageAQuai };
    return this.watchGetOneQuery<Response>({ variables });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { lieuPassageAQuai: LieuPassageAQuai };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.lieuPassageAQuai)
            resolve(new LieuPassageAQuai(res.data.lieuPassageAQuai));
        });
      });
  }

  getDataSource_v2(columns: Array<string>, pageSize?) {
    type Response = { allLieuPassageAQuai: RelayPage<LieuPassageAQuai> };
    return new DataSource({
      sort: [{ selector: "id" }],
      pageSize: pageSize ?? 20,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allLieuPassageAQuai)
                resolve(
                  this.asInstancedListCount(res.data.allLieuPassageAQuai)
                );
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }
}
