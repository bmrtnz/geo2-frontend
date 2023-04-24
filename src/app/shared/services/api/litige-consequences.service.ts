import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import LitigeConsequence from "app/shared/models/litige-consequence.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class LitigeConsequencesService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, LitigeConsequence);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { litigeConsequence: LitigeConsequence };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.litigeConsequence)
            resolve(new LitigeConsequence(res.data.litigeConsequence));
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

            type Response = { allLitigeConsequence: RelayPage<LitigeConsequence> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allLitigeConsequence) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitigeConsequence,
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
      .query<{ allLitigeConsequenceList: Partial<LitigeConsequence>[] }>({
        query: gql(this.buildGetListGraph(columns)),
        variables: { search },
      });
  }
}

