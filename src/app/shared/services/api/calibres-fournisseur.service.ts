import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import CalibreFournisseur from "app/shared/models/calibre-fournisseur.model";
import { takeWhile } from "rxjs/operators";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class CalibresFournisseurService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, CalibreFournisseur);
  }

  getOne_v2(key: any, columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ calibreFournisseur: CalibreFournisseur }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: key,
      })
      .pipe(takeWhile((res) => !res.loading));
  }
}
