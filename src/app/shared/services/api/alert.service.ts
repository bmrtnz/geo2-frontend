import { Apollo, gql } from "apollo-angular";
import { OperationVariables } from "@apollo/client/core";
import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import Alerte from "app/shared/models/alerte.model";


@Injectable({
  providedIn: "root",
})
export class AlertesService extends ApiService {

  public alerteParams() {
    return [
      "valide",
      "type",
      "message",
      "deroulant",
      "dateDebut",
      "dateFin",
      "secteur"
    ];
  }

  public alerteTypes() {
    return [
      { id: "I", description: "info" },
      { id: "W", description: "Warning" },
      { id: "S", description: "Success" },
    ];
  }

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Alerte);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.watchSaveQuery_v2({ variables }, columns);
  }

  fetchAlerte() {
    return this.apollo.query<{ fetchAlerte: Alerte }>({
      query: gql(
        ApiService.buildGraph("query", [
          {
            name: `fetchAlerte`,
            body: this.getCleanedFieldsName()
          },
        ])
      ),
      fetchPolicy: "no-cache",
    });
  }

  getCleanedFieldsName() {
    const fields = Alerte.getFieldsName();
    fields.delete("dateModification");
    fields.delete("userModification");
    fields.delete("secteur");
    fields.add("secteur.id");
    return fields;
  }

}
