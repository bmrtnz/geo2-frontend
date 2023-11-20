import { Apollo } from "apollo-angular";
import { OperationVariables } from "@apollo/client/core";
import { Injectable } from "@angular/core";
import { ApiService, APIRead } from "../api.service";

import { from } from "rxjs";
import Alerte from "app/shared/models/alerte.model";

@Injectable({
  providedIn: "root",
})
export class AlertesService extends ApiService implements APIRead {

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Alerte);
  }

  getOne(id: number) {
    const variables: OperationVariables = { id };
    type Response = { alerte: Alerte };
    return this.watchGetOneQuery<Response>({ variables });
  }

  getAll(columns: string[], filter: any[]) {
    return from(
      new Promise(async (resolve) => {
        type Response = { listAlerte: Alerte[] };
        const search = this.mapDXFilterToRSQL(filter);
        const query = await this.buildGetList(columns);
        this.listenQuery<Response>(
          query,
          { variables: { search }, fetchPolicy: "no-cache" },
          (res) => {
            if (res.data && res.data.listAlerte)
              resolve(res.data.listAlerte);
          }
        );
      })
    );
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

}
