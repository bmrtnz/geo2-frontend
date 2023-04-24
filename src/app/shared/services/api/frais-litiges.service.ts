import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import FraisLitige from "app/shared/models/litige-cause.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class FraisLitigesService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, FraisLitige);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { litigeCause: FraisLitige };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.litigeCause)
            resolve(new FraisLitige(res.data.litigeCause));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() as string }],
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

            type Response = { allFraisLitige: RelayPage<FraisLitige> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allFraisLitige) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allFraisLitige,
                    ),
                  );
                }
              },
            );
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  public getList(columns: Array<string>, search?: string) {
    return this.apollo
      .query<{ allFraisLitigeList: Partial<FraisLitige>[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
      });
  }
}

