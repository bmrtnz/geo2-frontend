import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DeviseRef from "app/shared/models/devise-ref.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { takeWhile } from "rxjs/operators";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class DevisesRefsService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, DeviseRef);
    this.gqlKeyType = "GeoDeviseRefKeyInput";
  }

  getOne(id: string, columns: Array<string>) {
    return this.apollo
      .query<{ deviseRef: DeviseRef }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getList(search: string, columns: Array<string>) {
    return this.apollo
      .query<{ allDeviseRefList: DeviseRef[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
        fetchPolicy: "network-only",
      })
      .pipe(takeWhile((res) => !res.loading));
  }

  getListDataSource(columns: Array<string>) {
    return new DataSource({
      reshapeOnPush: true,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            const { search } = this.mapLoadOptionsToVariables(options);
            const res = await this.getList(search, columns).toPromise();
            const data = JSON.parse(JSON.stringify(res.data.allDeviseRefList));
            resolve({
              data,
              totalCount: res.data.allDeviseRefList.length,
            });
          }),
        byKey: this.byKey_v2(columns)
      }),
    });
  }
  private byKey_v2(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { deviseRef: DeviseRef };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, res => {
          if (res.data && res.data.deviseRef)
            resolve(new DeviseRef(res.data.deviseRef));
        });
      });
  }

}
