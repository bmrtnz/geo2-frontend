import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import LitigeCause from "app/shared/models/litige-cause.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class LitigeCausesService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, LitigeCause);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { litigeCause: LitigeCause };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.litigeCause)
            resolve(new LitigeCause(res.data.litigeCause));
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

            type Response = { allLitigeCause: RelayPage<LitigeCause> };
            const query = await this.buildGetAll_v2(columns);
            const variables =
              this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.allLitigeCause) {
                  resolve(
                    this.asInstancedListCount(
                      res.data.allLitigeCause,
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
}

