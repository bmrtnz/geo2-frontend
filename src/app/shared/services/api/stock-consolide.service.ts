import { Injectable } from "@angular/core";
import {ApiService} from "../api.service";
import {Apollo} from "apollo-angular";
import {StockConsolide} from "../../models/stock-consolide.model";
import {gql} from "@apollo/client/core";

@Injectable({
  providedIn: "root"
})
export class StockConsolideService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo, StockConsolide);
  }

  save(stockConsolide: Partial<StockConsolide>) {
    return this.apollo.mutate({
      mutation: gql(this.buildSaveGraph()),
      variables: { stockConsolide }
    });
  }

}
