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

  /**
   * Persist a `PackListEntete` entity
   * @example
   * service.save({
   *   depart: new Date().toISOString(),
   *   livraison: new Date().toISOString(),
   *   impression: new Date().toISOString(),
   *   numeroPo: "YO",
   *   typeTier: { id: "C" },
   *   mail: "[mail]",
   *   ordres: [{ ordre: { id: "000432" } }],
   * }, new Set(["id"])).subscribe();
   */
  save(packlistEntete: Partial<PacklistEntete>, body: Set<string>) {
    return this.apollo.mutate({
      mutation: gql(this.buildSaveGraph([...body])),
      variables: { packlistEntete },
    });
  }
}
