import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { CertificationModeCulture } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class CertificationsModesCultureService
  extends ApiService
  implements APIRead
{
  constructor(apollo: Apollo) {
    super(apollo, CertificationModeCulture);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { certificationModeCulture: CertificationModeCulture };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.certificationModeCulture)
            resolve(
              new CertificationModeCulture(res.data.certificationModeCulture)
            );
        });
      });
  }

  getDataSource_v2(columns: Array<string>, pageSize?) {
    return new DataSource({
      sort: [{ selector: this.model.getKeyField() as string }],
      pageSize: pageSize ? pageSize : 20,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = {
              allCertificationModeCulture: RelayPage<CertificationModeCulture>;
            };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allCertificationModeCulture) {
                resolve(
                  this.asInstancedListCount(
                    res.data.allCertificationModeCulture
                  )
                );
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
