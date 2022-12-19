import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import PacklistEntete from "app/shared/models/packlist-entete.model";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class PacklistsService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, PacklistEntete);
  }

  save(packlist: Partial<PacklistEntete>, body: Set<string>) {
    return this.apollo.mutate({
      mutation: gql(ApiService.buildGraph(
        "mutation",
        [
          {
            name: `savePacklist`,
            body,
            params: [{ name: "packlist", value: "packlist", isVariable: true }],
          },
        ],
        [{ name: "packlist", type: `GeoPacklistEnteteInput`, isOptionnal: false }],
      )),
      variables: { packlist },
    });
  }
}
