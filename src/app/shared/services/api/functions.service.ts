import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { ApiService } from "../api.service";

export type FunctionResponse = { res: number, msg?: string, data?: Record<string, any> };
const body = ["res", "msg", "data"];

@Injectable({
  providedIn: "root"
})
export class FunctionsService {

  constructor(
    private apollo: Apollo,
  ) { }

  /**
   * Vérifie si la création de l'ordre pour l'entrepot est autorisé
   */
  public ofValideEntrepotForOrdre =
    (entrepotID: string) => this.apollo.watchQuery<{ ofValideEntrepotForOrdre: FunctionResponse }>({
      query: gql(ApiService.buildGraph(
        "query",
        [
          {
            name: "ofValideEntrepotForOrdre",
            body,
            params: [{ name: "entrepotID", value: "entrepotID", isVariable: true }]
          }
        ],
        [
          { name: "entrepotID", type: "String", isOptionnal: false }
        ],
      )),
      variables: { entrepotID },
      fetchPolicy: "network-only",
    })

  /**
   * Genere un nouvel ordre pour une société
   */
  public fNouvelOrdre =
    (societe: string) => this.apollo.watchQuery<{ fNouvelOrdre: FunctionResponse }>({
      query: gql(ApiService.buildGraph(
        "query",
        [
          {
            name: "fNouvelOrdre",
            body,
            params: [{ name: "societe", value: "societe", isVariable: true }]
          }
        ],
        [
          { name: "societe", type: "String", isOptionnal: false }
        ],
      )),
      variables: { societe },
      fetchPolicy: "network-only",
    })

  /**
   * Génère une nouvelle ligne d'ordre avec l'article sélectionné.
   */
  public ofInitArticle =
    (ordreRef: string, articleRef: string, societeCode: string) => this.apollo
      .watchQuery<{ ofInitArticle: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofInitArticle",
              body,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "articleRef", value: "articleRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "articleRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef, articleRef, societeCode },
        fetchPolicy: "network-only",
      })

  /**
   * Indicateur du blocage de l'ordre dont le départ est aujourd'hui
   */
  public fInitBlocageOrdre =
    (ordreRef: string, userName: string) => this.apollo
      .watchQuery<{ fInitBlocageOrdre: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fInitBlocageOrdre",
              body,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "userName", value: "userName", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "userName", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef, userName },
        fetchPolicy: "network-only",
      })

  /**
   * Verification de la bonne conformité de la logistique
   * avant envoi de documents et validation bon à facturer
   */
  public fVerifLogistiqueOrdre =
    (ordreRef: string) => this.apollo
      .watchQuery<{ fVerifLogistiqueOrdre: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fVerifLogistiqueOrdre",
              body,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification nb palettes commandées sur une ligne d'ordre
   */
  public onChangeCdeNbPal =
    (ordreLigneRef: string, secteurCommercialCode: string) => this.apollo
      .watchQuery<{ onChangeCdeNbPal: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeCdeNbPal",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "secteurCommercialCode", value: "secteurCommercialCode", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "secteurCommercialCode", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLigneRef, secteurCommercialCode },
        fetchPolicy: "network-only",
      })


  /**
   * Event modification nb palettes intermédiaires sur une ligne d'ordre
   */
  public onChangeDemipalInd =
    (ordreLigneRef: string, username: string) => this.apollo
      .watchQuery<{ onChangeCdeNbPal: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeDemipalInd",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "username", value: "username", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLigneRef, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification nb colis par palette sur une ligne d'ordre
   */
  public onChangePalNbCol =
    (ordreLigneRef: string, username: string) => this.apollo
      .watchQuery<{ onChangeCdeNbPal: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangePalNbCol",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "username", value: "username", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLigneRef, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification nb colis par palette sur une ligne d'ordre
   */
  public onChangeCdeNbCol =
    (ordreLigneRef: string, username: string) => this.apollo
      .watchQuery<{ onChangeCdeNbCol: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeCdeNbCol",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "username", value: "username", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLigneRef, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification propriétaire marchandise
   */
  public onChangeProprCode =
    (ordreLigneRef: string, societeCode: string, username: string) => this.apollo
      .watchQuery<{ onChangeProprCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeProprCode",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "username", value: "username", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef, societeCode, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification fournisseur
   */
  public onChangeFouCode =
    (ordreLigneRef: string, societeCode: string, username: string) => this.apollo
      .watchQuery<{ onChangeFouCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeFouCode",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "username", value: "username", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef, societeCode, username },
        fetchPolicy: "network-only",
      })


  /**
   * Event modification PU Vente
   */
  public onChangeVtePu =
    (ordreLigneRef: string) => this.apollo
      .watchQuery<{ onChangeVtePu: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeVtePu",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification gratuit
   */
  public onChangeIndGratuit =
    (ordreLigneRef: string) => this.apollo
      .watchQuery<{ onChangeIndGratuit: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeIndGratuit",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification type palette
   */
  public onChangePalCode =
    (ordreLigneRef: string, secteurCode: string, username: string) => this.apollo
      .watchQuery<{ onChangePalCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangePalCode",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "secteurCode", value: "secteurCode", isVariable: true },
                { name: "username", value: "username", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "secteurCode", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef, secteurCode, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification palette intermédiaire
   */
  public onChangePalinterCode =
    (ordreLigneRef: string) => this.apollo
      .watchQuery<{ onChangePalinterCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangePalinterCode",
              body,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef },
        fetchPolicy: "network-only",
      })

}
