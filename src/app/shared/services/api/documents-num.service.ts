import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import DocumentNum from "app/shared/models/document-num.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { from, iif } from "rxjs";
import { map, mergeMap, toArray } from "rxjs/operators";
import { ApiService, DistinctInfo, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class DocumentsNumService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, DocumentNum);
    this.gqlKeyType = "GeoDocumentNumKeyInput";
  }

  getOne(
    id: {
      ordreNumero: DocumentNum["ordreNumero"],
      typeDocument: DocumentNum["typeDocument"],
      anneeCreation: DocumentNum["anneeCreation"],
    },
    body: Set<string>,
  ) {
    return this.apollo
      .query<{ documentNum: DocumentNum }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: this.model.name.lcFirst(),
              body,
              params: [{ name: "id", value: "id", isVariable: true }],
            },
          ],
          [{ name: "id", type: this.gqlKeyType, isOptionnal: false }],
        )),
        variables: { id },
        fetchPolicy: "cache-first",
      })
      .pipe(
        map(res => res.data.documentNum),
      );
  }

  count(search?) {
    return this.apollo
      .query<{ countDocumentNum: number }>({
        query: gql(this.buildCountGraph()),
        variables: { search },
        fetchPolicy: "cache-first",
      })
      .pipe(
        map(res => res.data.countDocumentNum),
      );
  }

  getDataSource(body: Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        // key: ["ordreNumero", "typeDocument", "anneeCreation"],
        load: (options: LoadOptions) =>
          iif(() => options.group,
            this.apollo
              .query<{ distinct: RelayPage<DistinctInfo>, totalCount: number, totalPage: number }>({
                query: gql(this.buildDistinctGraph()),
                variables: this.mapLoadOptionsToVariables(options),
                fetchPolicy: "cache-first",
              }),
            this.apollo
              .query<{ allDocumentNum: RelayPage<DocumentNum> }>({
                query: gql(this.buildGetPageGraph(body)),
                variables: this.mapLoadOptionsToVariables(options),
                fetchPolicy: "cache-first",
              })
              .pipe(
                mergeMap(res => from(res.data.allDocumentNum.edges)),
                map(edge => edge.node),
                toArray(),
              ),
          ).toPromise(),
        byKey: key => this.getOne(key, body).toPromise(),
      }),
    });
  }
}
