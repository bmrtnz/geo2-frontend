import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import CommandeEdi from "app/shared/models/commande-edi.model";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { map } from "rxjs/operators";
import { ApiService, Pageable, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class OrdresEdiService {

  constructor(
    public apollo: Apollo
  ) { }

  /**
   * Récupération de tous les ordres EDI
   */
  public allCommandeEdi(
    secteurId: string, clientId: string, assistantId: string, commercialId: string, status: string, dateMin: Date, dateMax: Date
  ) {
    return this.apollo
      .query<{ allCommandeEdi: CommandeEdi[] }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: `allCommandeEdi`,
              body: CommandeEdi.getFieldsName(),
              params: [
                { name: "secteurId", value: "secteurId", isVariable: true },
                { name: "clientId", value: "clientId", isVariable: true },
                { name: "assistantId", value: "assistantId", isVariable: true },
                { name: "commercialId", value: "commercialId", isVariable: true },
                { name: "status", value: "status", isVariable: true },
                { name: "dateMin", value: "dateMin", isVariable: true },
                { name: "dateMax", value: "dateMax", isVariable: true },
              ],
            },
          ],
          [
            { name: "secteurId", type: "String", isOptionnal: false },
            { name: "clientId", type: "String", isOptionnal: true },
            { name: "assistantId", type: "String", isOptionnal: true },
            { name: "commercialId", type: "String", isOptionnal: true },
            { name: "status", type: "String", isOptionnal: true },
            { name: "dateMin", type: "LocalDateTime", isOptionnal: true },
            { name: "dateMax", type: "LocalDateTime", isOptionnal: true },
          ],
        )),
        variables: { secteurId, clientId, assistantId, commercialId, status, dateMin, dateMax },
        fetchPolicy: "network-only",
      });
  }

  // public  getDistinctEntityDatasource(fieldName, searchExpr?) {
  //   return this.apollo.query<{ distinct: RelayPage<{ count: number, key: string, description: string }> }>({
  //     query: gql(ApiService.buildDistinctGraph()),
  //     variables: {
  //       field: fieldName, // E.g. "espece.id"
  //       type: "GeoCommandeEdi",
  //       search: searchExpr,
  //       pageable: {
  //         pageNumber: 0,
  //         pageSize: 500,
  //       } as Pageable,
  //     },
  //   }).pipe(
  //     map(res => new DataSource({
  //       store: new ArrayStore({
  //         data: res.data.distinct.edges,
  //       }),
  //       key: "key",
  //     })),
  //   );
  // }

}
