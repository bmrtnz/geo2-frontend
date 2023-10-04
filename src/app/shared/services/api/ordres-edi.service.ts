import { Injectable } from "@angular/core";
import { OperationVariables } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { Client } from "app/shared/models";
import ClientEdi from "app/shared/models/client-edi.model";
import CommandeEdi from "app/shared/models/commande-edi.model";
import EdiOrdre from "app/shared/models/edi-ordre.model";
import { ApiService } from "../api.service";
import { FunctionsService } from "./functions.service";

@Injectable({
  providedIn: "root",
})
export class OrdresEdiService extends ApiService {
  constructor(
    public functionsService: FunctionsService,
    public apollo: Apollo
  ) {
    super(apollo, EdiOrdre);
    this.gqlKeyType = "BigDecimal";
  }

  getOne(id: EdiOrdre["id"], columns: Array<string> | Set<string>) {
    return this.apollo
      .query<{ ediOrdre: EdiOrdre }>({
        query: gql(this.buildGetOneGraph(columns)),
        variables: { id },
      })
  }

  /**
   * Récupération de tous les ordres EDI
   */
  public allCommandeEdi(
    ediOrdreId: string,
    secteurId: string,
    nomUtilisateur: string,
    clientId: string,
    assistantId: string,
    commercialId: string,
    status: string,
    dateMin: Date,
    dateMax: Date,
    typeSearch: 'livraison' | 'creation',
    columns: string[]
  ) {
    return this.apollo.query<{ allCommandeEdi: CommandeEdi[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allCommandeEdi`,
              body: columns,
              params: [
                { name: "ediOrdreId", value: "ediOrdreId", isVariable: true },
                { name: "secteurId", value: "secteurId", isVariable: true },
                {
                  name: "nomUtilisateur",
                  value: "nomUtilisateur",
                  isVariable: true,
                },
                { name: "clientId", value: "clientId", isVariable: true },
                { name: "assistantId", value: "assistantId", isVariable: true },
                {
                  name: "commercialId",
                  value: "commercialId",
                  isVariable: true,
                },
                { name: "status", value: "status", isVariable: true },
                { name: "dateMin", value: "dateMin", isVariable: true },
                { name: "dateMax", value: "dateMax", isVariable: true },
                { name: "typeSearch", value: "typeSearch", isVariable: true },
              ],
            },
          ],
          [
            { name: "ediOrdreId", type: "String", isOptionnal: false },
            { name: "secteurId", type: "String", isOptionnal: false },
            { name: "nomUtilisateur", type: "String", isOptionnal: true },
            { name: "clientId", type: "String", isOptionnal: true },
            { name: "assistantId", type: "String", isOptionnal: true },
            { name: "commercialId", type: "String", isOptionnal: true },
            { name: "status", type: "String", isOptionnal: true },
            { name: "dateMin", type: "LocalDateTime", isOptionnal: true },
            { name: "dateMax", type: "LocalDateTime", isOptionnal: true },
            { name: "typeSearch", type: "String", isOptionnal: false },
          ]
        )
      ),
      variables: {
        ediOrdreId,
        secteurId,
        nomUtilisateur,
        clientId,
        assistantId,
        commercialId,
        status,
        dateMin,
        dateMax,
        typeSearch,
      },
      fetchPolicy: "no-cache",
    });
  }

  /**
   * Récupération de tous les clients EDI selon assistante et commercial
   */

  public allClientEdi(
    secteurId: string,
    assistantId: string,
    commercialId: string
  ) {
    const columns = Client.getFieldsName();
    columns.clear();
    columns.add("client.id");
    columns.add("client.code");
    columns.add("client.raisonSocial");
    columns.add("id");
    columns.add("code");
    return this.apollo.query<{ allClientEdi: ClientEdi[] }>({
      query: gql(
        ApiService.buildGraph(
          "query",
          [
            {
              name: `allClientEdi`,
              body: columns,
              params: [
                { name: "secteurId", value: "secteurId", isVariable: true },
                { name: "assistantId", value: "assistantId", isVariable: true },
                {
                  name: "commercialId",
                  value: "commercialId",
                  isVariable: true,
                },
              ],
            },
          ],
          [
            { name: "secteurId", type: "String", isOptionnal: false },
            { name: "assistantId", type: "String", isOptionnal: true },
            { name: "commercialId", type: "String", isOptionnal: true },
          ]
        )
      ),
      variables: { secteurId, assistantId, commercialId },
      fetchPolicy: "network-only",
    });
  }

  /**
   * Création d'un ordre EDI
   */
  public fCreeOrdresEdi(
    societeId: string,
    entrepotId: string,
    dateLivraison: string,
    campagneId: string,
    referenceCommande: string,
    referenceClient: string,
    ediOrdreId: string,
    username: string
  ) {
    return this.functionsService.queryFunction("fCreeOrdresEdi", [
      { name: "societeId", type: "String", value: societeId },
      { name: "entrepotId", type: "String", value: entrepotId },
      { name: "dateLivraison", type: "String", value: dateLivraison },
      { name: "campagneId", type: "String", value: campagneId },
      { name: "referenceCommande", type: "String", value: referenceCommande },
      { name: "referenceClient", type: "String", value: referenceClient },
      { name: "ediOrdreId", type: "String", value: ediOrdreId },
      { name: "username", type: "String", value: username },
    ]);
  }

  save_v2(columns: Array<string>, variables: OperationVariables) {
    return this.apollo.mutate<{ saveEdiOrdre: EdiOrdre }>({
      mutation: gql(this.buildSaveGraph(columns)),
      variables,
    });
  }
}
