import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { OrdreLigne } from "app/shared/models";
import DocumentNum from "app/shared/models/document-num.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import FileSystemItem from "devextreme/file_management/file_system_item";
import { from, iif } from "rxjs";
import { concatMap, filter, map, mergeMap, tap, toArray } from "rxjs/operators";
import { ApiService, DistinctInfo, RelayPage } from "../api.service";
import { FileManagerService } from "../file-manager.service";

@Injectable({
  providedIn: "root",
})
export class DocumentsNumService extends ApiService {
  constructor(apollo: Apollo, private fm: FileManagerService) {
    super(apollo, DocumentNum);
    this.gqlKeyType = "GeoDocumentNumKeyInput";
  }

  static getCacheID(data: Partial<DocumentNum>) {
    return `GeoDocumentNum:${data.ordreNumero}-${data.typeDocument}-${data.anneeCreation}`;
  }

  getOne(
    id: {
      ordreNumero: DocumentNum["ordreNumero"];
      typeDocument: DocumentNum["typeDocument"];
      anneeCreation: DocumentNum["anneeCreation"];
    },
    body: Set<string>
  ) {
    return this.apollo
      .query<{ documentNum: DocumentNum }>({
        query: gql(
          ApiService.buildGraph(
            "query",
            [
              {
                name: this.model.name.lcFirst(),
                body,
                params: [{ name: "id", value: "id", isVariable: true }],
              },
            ],
            [{ name: "id", type: this.gqlKeyType, isOptionnal: false }]
          )
        ),
        variables: { id },
        fetchPolicy: "no-cache",
      })
      .pipe(map((res) => res.data.documentNum));
  }

  getList(body: Set<string>, search?: string) {
    return this.apollo
      .query<{ allDocumentNumList: DocumentNum[] }>({
        query: gql(this.buildGetListGraph(body)),
        variables: { search },
        fetchPolicy: "no-cache",
      })
      .pipe(map((res) => res.data.allDocumentNumList));
  }

  count(search?: string) {
    return this.apollo
      .query<{ countDocumentNum: number }>({
        query: gql(this.buildCountGraph()),
        variables: { search },
        fetchPolicy: "no-cache",
      })
      .pipe(map((res) => res.data.countDocumentNum));
  }

  delete(id: {
    ordreNumero: DocumentNum["ordreNumero"];
    typeDocument: DocumentNum["typeDocument"];
    anneeCreation: DocumentNum["anneeCreation"];
  }) {
    console.log(id);
    return this.apollo
      .mutate<{ deleteDocumentNum: boolean }>({
        mutation: gql(this.buildDeleteGraph(this.gqlKeyType)),
        variables: { id },
      })
      .pipe(map((res) => res.data.deleteDocumentNum));
  }

  deleteByIdAndOrdreLigneAndTypeDocument(
    id: string,
    ordreLigne: Partial<OrdreLigne>,
    typeDocument: string
  ) {
    return this.apollo
      .mutate<{ deleteByIdAndOrdreLigneAndTypeDocument: boolean }>({
        mutation: gql(
          ApiService.buildGraph(
            "mutation",
            [
              {
                name: "deleteByIdAndOrdreLigneAndTypeDocument",
                params: [
                  { name: "id", value: "id", isVariable: true },
                  { name: "ordreLigne", value: "ordreLigne", isVariable: true },
                  {
                    name: "typeDocument",
                    value: "typeDocument",
                    isVariable: true,
                  },
                ],
              },
            ],
            [
              { name: "id", type: "String", isOptionnal: false },
              {
                name: "ordreLigne",
                type: "GeoOrdreLigneInput",
                isOptionnal: false,
              },
              { name: "typeDocument", type: "String", isOptionnal: false },
            ]
          )
        ),
        variables: { id, ordreLigne, typeDocument },
      })
      .pipe(map((res) => res.data.deleteByIdAndOrdreLigneAndTypeDocument));
  }

  save(documentNum: Partial<DocumentNum>, body: Set<string>) {
    return this.apollo
      .mutate<{ saveDocumentNum: DocumentNum }>({
        mutation: gql(this.buildSaveGraph([...body])),
        variables: { documentNum },
      })
      .pipe(map((res) => res.data.saveDocumentNum));
  }

  getDataSource(body: Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        key: ["ordreNumero", "typeDocument", "anneeCreation"],
        load: (options: LoadOptions) =>
          iif(
            () => !!options.group,
            this.apollo.query<{
              distinct: RelayPage<DistinctInfo>;
              totalCount: number;
              totalPage: number;
            }>({
              query: gql(this.buildDistinctGraph()),
              variables: this.mapLoadOptionsToVariables(options),
              fetchPolicy: "cache-first",
            }),
            this.apollo
              .query<{ allDocumentNum: RelayPage<DocumentNum> }>({
                query: gql(
                  this.buildGetPageGraph(
                    new Set([
                      "ordreNumero",
                      "typeDocument",
                      "anneeCreation",
                      ...body,
                    ])
                  )
                ),
                variables: this.mapLoadOptionsToVariables(options),
                fetchPolicy: "cache-first",
              })
              .pipe(
                map((res) => this.asInstancedListCount(res.data.allDocumentNum))
              )
          ).toPromise(),
        byKey: (key) => this.getOne(key, body).toPromise(),
        update: (key, values) => {
          return this.save({ ...key, ...values }, body).toPromise();
        },
      }),
    });
  }

  downloadPhotos(search?: string) {
    const baseArgs = { key: "GEO_CQ_PHOTOS" };
    return this.getList(
      new Set(["nomFichier", "anneeCreation", "moisCreation"]),
      search
    )
      .pipe(
        mergeMap((docs) => from(docs)),
        filter((doc) => !!doc.nomFichier),
        map(
          (doc) =>
            new FileSystemItem(
              `${doc.anneeCreation}/${doc.moisCreation}/${doc.nomFichier}`,
              false
            )
        ),
        toArray()
      )
      .subscribe((res) => this.fm.downloadItems.call({ baseArgs }, res));
  }
}
