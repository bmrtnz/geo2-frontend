import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import StockMouvement from "app/shared/models/stock-mouvement.model";
import { ApiService } from "../api.service";

@Injectable({
  providedIn: "root"
})
export class StockMouvementsService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, StockMouvement);
  }

  public deleteStockMouvement(id: string) {
    return this.apollo.mutate({
      mutation: gql(this.buildDeleteGraph()),
      variables: { id },
    });
  }
}
