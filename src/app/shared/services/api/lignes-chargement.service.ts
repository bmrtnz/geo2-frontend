import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { OrdreLigne } from "app/shared/models";
import LigneChargement from "app/shared/models/ligne-chargement.model";
import DataSource from "devextreme/data/data_source";
import { map } from "rxjs/operators";
import { ApiService } from "../api.service";
import { CurrentCompanyService } from "../current-company.service";

export type QueryArgs = { codeChargement: string, campagne: string };
export type Operation = "transfer" | "duplicate";

@Injectable({
  providedIn: "root"
})
export class LignesChargementService extends ApiService {

  constructor(
    apollo: Apollo,
    private currentCompanyService: CurrentCompanyService,
  ) {
    super(apollo, LigneChargement);
  }

  getDatasource(variables: QueryArgs, columns: Set<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: options => this
          .getList(variables, columns)
          .pipe(map(res => res.data.allLignesChargement))
          .toPromise(),
      }),
    });
  }

  getList(variables: QueryArgs, columns: Set<string>) {
    return this.apollo
      .query<{ allLignesChargement: Partial<LigneChargement[]> }>({
        query: gql(this.buildListGraph(columns)),
        variables,
        fetchPolicy: "network-only",
      });
  }

  private buildListGraph(body: Set<string>) {
    return ApiService.buildGraph("query",
      [{
        name: "allLignesChargement",
        body,
        params: [
          { name: "codeChargement", value: "codeChargement", isVariable: true },
          { name: "campagne", value: "campagne", isVariable: true },
        ],
      }],
      [
        { name: "codeChargement", type: "String", isOptionnal: false },
        { name: "campagne", type: "String", isOptionnal: false },
      ],
    );
  }

  saveAll(allLigneChargement: Partial<LigneChargement>[], columns: Set<string>) {
    return this.apollo.mutate({
      mutation: gql(this.buildSaveAllGraph([...columns])),
      variables: { allLigneChargement },
    });
  }

  transferOrDuplicate(
    operation: Operation,
    ordreLignesID: Array<string>,
    codeChargement: string,
    originalOrdreId: string,
    body: Set<string>,
  ) {
    return this.apollo.query<{ [operation: string]: Partial<OrdreLigne> }>({
      query: gql(this.buildDuplicateTransferGraph(operation, body)),
      variables: {
        ordreLignesID,
        codeChargement,
        originalOrdreId,
        societeId: this.currentCompanyService.getCompany().id,
      }
    });
  }

  private buildDuplicateTransferGraph(
    operation: Operation,
    body: Set<string>,
  ) {
    return ApiService.buildGraph("query",
      [{
        name: operation,
        body,
        params: [
          { name: "ordreLignesID", value: "ordreLignesID", isVariable: true },
          { name: "codeChargement", value: "codeChargement", isVariable: true },
          { name: "originalOrdreId", value: "originalOrdreId", isVariable: true },
          { name: "societeId", value: "societeId", isVariable: true },
        ],
      }],
      [
        { name: "ordreLignesID", type: "[String]", isOptionnal: false },
        { name: "codeChargement", type: "String", isOptionnal: false },
        { name: "originalOrdreId", type: "String", isOptionnal: false },
        { name: "societeId", type: "String", isOptionnal: false },
      ],
    );
  }
}
