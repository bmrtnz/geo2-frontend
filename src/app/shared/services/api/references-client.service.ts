import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { Article } from "app/shared/models";
import ReferenceClient from "app/shared/models/reference-client.model";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class ReferencesClientService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, ReferenceClient);
  }

  public saveAll(allReferenceClient: Array<Partial<ReferenceClient>>, body: Set<string>) {
    return this.apollo.mutate<{ saveAllReferenceClient: Array<Partial<ReferenceClient>> }>({
      mutation: gql(this.buildSaveAllGraph([...body])),
      variables: { allReferenceClient }
    });
  }

  public removeRefs(client: string, articles: Array<Article["id"]>) {
    return this.apollo.mutate({
      mutation: gql(ApiService.buildGraph("mutation",
        [
          {
            name: "removeRefs",
            params: [
              { name: "client", value: "client", isVariable: true },
              { name: "articles", value: "articles", isVariable: true },
            ]
          }
        ],
        [
          { name: "client", type: "String", isOptionnal: false },
          { name: "articles", type: "[String]", isOptionnal: false },
        ])),
      variables: { client, articles },
    });
  }
}
