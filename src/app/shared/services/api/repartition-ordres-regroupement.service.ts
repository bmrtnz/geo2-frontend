import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import OrdreRegroupement from "../../models/ordre-regroupement.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data";
import { APIRead, ApiService } from "../api.service";
import {lastValueFrom} from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RepartitionOrdresRegroupementService
  extends ApiService
  implements APIRead
{
  readonly operation = "allOrdresRegroupement";

  constructor(apollo: Apollo) {
    super(apollo, OrdreRegroupement);
  }

  public persistantVariables: Record<string, any> = {};

  setPersisantVariables(params = this.persistantVariables) {
    this.persistantVariables = params;
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            const query = await this.buildList(columns, this.operation);
            type Response = {
              [operation: string]: OrdreRegroupement[];
            };

            const variables = this.persistantVariables;
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data[this.operation]) {
                resolve({
                  data: res.data[this.operation],
                  totalCount: res.data[this.operation].length,
                });
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { ordresRegroupement: OrdreRegroupement };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.ordresRegroupement)
            resolve(new OrdreRegroupement(res.data.ordresRegroupement));
        });
      });
  }

  protected async buildGetAllOrdresRegroupement(columns: Array<string>) {
    const alias = this.operation.ucFirst();
    return `
      query ${alias}(
        $search: String,
        $pageable: PaginationInput!,
        $dateMin: LocalDateTime!,
        $dateMax: LocalDateTime!,
        $transporteurCode: String,
        $stationCode: String,
        $commercialCode: String
      ) {
        ${this.operation}(
          search:$search,
          pageable:$pageable,
          dateMin: $dateMin,
          dateMax: $dateMax,
          transporteurCode: $transporteurCode,
          stationCode: $stationCode,
          commercialCode: $commercialCode
        ) {
          edges {
            node {
              ${await lastValueFrom(this.model.getGQLObservable(columns))}
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          totalCount
        }
      }
    `;
  }

  protected async buildList(columns: Array<string>, operationName?: string) {
    const alias = this.operation.ucFirst();
    return `
      query ${alias}(
        $dateMin: LocalDateTime!,
        $dateMax: LocalDateTime!,
        $commercialCode: String,
        $stationCode: String,
        $transporteurCode: String
      ) {
        ${this.operation}(
          dateMin: $dateMin,
          dateMax: $dateMax,
          commercialCode: $commercialCode,
          stationCode: $stationCode,
          transporteurCode: $transporteurCode
        ) {
            ${await lastValueFrom(this.model.getGQLObservable(columns))}
        }
      }
    `;
  }
}
