import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { ApiService } from "../api.service";

export enum FunctionResult {
  Error = 0,    // Unknown/error
  OK = 1,       // OK
  Warning = 2,  // Warning
}
export type FunctionResponse<T = Record<string, any>> = { res: FunctionResult, msg?: string, data?: T };
export const functionBody = ["res", "msg", "data"];

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
            body: functionBody,
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
            body: functionBody,
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
              body: functionBody,
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
   * Génère une nouvelle ligne d'ordre depuis l'historique avec l'article sélectionné.
   */
  public ofInitArticleHistory =
    (ordreRef: string, articleRef: string, societeCode: string, fromLigneRef: string) => this.apollo
      .watchQuery<{ ofInitArticleHistory: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofInitArticleHistory",
              body: functionBody,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "articleRef", value: "articleRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "fromLigneRef", value: "fromLigneRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "articleRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "fromLigneRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef, articleRef, societeCode, fromLigneRef },
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
              body: functionBody,
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
   * Calcule la marge prévisionnelle
   */

  public fCalculMargePrevi =
    (ordreRef: string, socCode: string) => this.apollo
      .watchQuery<{ fCalculMargePrevi: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fCalculMargePrevi",
              body: functionBody,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "socCode", value: "socCode", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "socCode", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef, socCode },
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
              body: functionBody,
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
   * Ajoute un lieu de passage dans la logistique
   */
  public fAjoutOrdlog =
    (ordreLogRef: string, typePassage: string, choixPassage: string) => this.apollo
      .watchQuery<{ fAjoutOrdlog: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fAjoutOrdlog",
              body: functionBody,
              params: [
                { name: "ordreLogRef", value: "ordreLogRef", isVariable: true },
                { name: "typePassage", value: "typePassage", isVariable: true },
                { name: "choixPassage", value: "choixPassage", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLogRef", type: "String", isOptionnal: false },
            { name: "typePassage", type: "String", isOptionnal: false },
            { name: "choixPassage", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLogRef, typePassage, choixPassage },
        fetchPolicy: "network-only",
      })
  /**
   * Point d'entrée pour la gestion des flux de documents
   */
  public geoPrepareEnvois =
    (
      ordRef: string,
      fluCode: string,
      modeAuto: boolean,
      annOrdre: boolean,
      user: string,
    ) => this.apollo
      .watchQuery<{ geoPrepareEnvois: FunctionResponse<{ contacts: any[] }> }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "geoPrepareEnvois",
              body: functionBody,
              params: [
                { name: "ordRef", value: "ordRef", isVariable: true },
                { name: "fluCode", value: "fluCode", isVariable: true },
                { name: "modeAuto", value: "modeAuto", isVariable: true },
                { name: "annOrdre", value: "annOrdre", isVariable: true },
                { name: "user", value: "user", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordRef", type: "String", isOptionnal: false },
            { name: "fluCode", type: "String", isOptionnal: false },
            { name: "modeAuto", type: "Boolean", isOptionnal: false },
            { name: "annOrdre", type: "Boolean", isOptionnal: false },
            { name: "user", type: "String", isOptionnal: false },
          ],
        )),
        variables: {
          ordRef,
          fluCode,
          modeAuto,
          annOrdre,
          user
        },
        fetchPolicy: "network-only",
      })

  /**
   * Gestion spécifique des annule-et-remplace
   * Pour Geo2, créé des lignes envois avec `traite = R`
   */
  public ofAREnvois =
    (ordRef: string) => this.apollo
      .watchQuery<{ ofAREnvois: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "ofAREnvois",
              body: functionBody,
              params: [
                { name: "ordRef", value: "ordRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordRef },
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
              body: functionBody,
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
  // public onChangeDemipalInd =
  //   (ordreLigneRef: string, username: string) => this.apollo
  //     .watchQuery<{ onChangeCdeNbPal: FunctionResponse }>({
  //       query: gql(ApiService.buildGraph(
  //         "query",
  //         [
  //           {
  //             name: "onChangeDemipalInd",
  //             body,
  //             params: [
  //               { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
  //               { name: "username", value: "username", isVariable: true },
  //             ]
  //           }
  //         ],
  //         [
  //           { name: "ordreLigneRef", type: "String", isOptionnal: false },
  //           { name: "username", type: "String", isOptionnal: false },
  //         ],
  //       )),
  //       variables: { ordreLigneRef, username },
  //       fetchPolicy: "network-only",
  //     })

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
              body: functionBody,
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
              body: functionBody,
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
              body: functionBody,
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
              body: functionBody,
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
              body: functionBody,
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
              body: functionBody,
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
              body: functionBody,
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
   * Event modification type palette intermédiaire
   */
  public onChangePalinterCode =
    (ordreLigneRef: string) => this.apollo
      .watchQuery<{ onChangePalinterCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangePalinterCode",
              body: functionBody,
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
   * Event modification nb palette intermédiaire
   */
  public onChangePalNbPalinter =
    (ordreLigneRef: string, username: string) => this.apollo
      .watchQuery<{ onChangePalNbPalinter: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangePalNbPalinter",
              body: functionBody,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "username", value: "username", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef, username },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification PU Dev Achat
   */
  public onChangeAchDevPu =
    (ordreLigneRef: string, societeCode: string) => this.apollo
      .watchQuery<{ onChangePalinterCode: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "onChangeAchDevPu",
              body: functionBody,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true }
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false }
          ],
        )),
        variables: { ordreLigneRef, societeCode },
        fetchPolicy: "network-only",
      })

  /**
   * Event auto button click (details expédition)
   */
  public fDetailsExpOnClickAuto =
    (ordreLigneRef: string) => this.apollo
      .query<{ fDetailsExpOnClickAuto: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fDetailsExpOnClickAuto",
              body: functionBody,
              params: [
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreLigneRef },
        fetchPolicy: "network-only",
      })

  public fChgtQteArtRet =
    (ordreRef: string) => this.apollo
      .query<{ fChgtQteArtRet: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fChgtQteArtRet",
              body: functionBody,
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
   * Event modifier button click (details expédition)
   */
  public fDetailsExpClickModifier =
    (ordreRef: string, ordreLigneRef: string, historiqueRef: string) => this.apollo
      .query<{ fDetailsExpClickModifier: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fDetailsExpClickModifier",
              body: functionBody,
              params: [
                { name: "ordreRef", value: "ordreRef", isVariable: true },
                { name: "ordreLigneRef", value: "ordreLigneRef", isVariable: true },
                { name: "historiqueRef", value: "historiqueRef", isVariable: true },
              ]
            }
          ],
          [
            { name: "ordreRef", type: "String", isOptionnal: false },
            { name: "ordreLigneRef", type: "String", isOptionnal: false },
            { name: "historiqueRef", type: "String", isOptionnal: false },
          ],
        )),
        variables: { ordreRef, ordreLigneRef, historiqueRef },
        fetchPolicy: "network-only",
      })

  /**
   * Event modification clôture row synthèse exp.
   */
  public fDetailsExpOnCheckCloturer =
    (devalexpRef: string, logistiqueRef: string, societeCode: string, username: string) => this.apollo
      .watchQuery<{ fDetailsExpOnCheckCloturer: FunctionResponse }>({
        query: gql(ApiService.buildGraph(
          "query",
          [
            {
              name: "fDetailsExpOnCheckCloturer",
              body: functionBody,
              params: [
                { name: "devalexpRef", value: "devalexpRef", isVariable: true },
                { name: "logistiqueRef", value: "logistiqueRef", isVariable: true },
                { name: "societeCode", value: "societeCode", isVariable: true },
                { name: "username", value: "username", isVariable: true }
              ]
            }
          ],
          [
            { name: "devalexpRef", type: "String", isOptionnal: false },
            { name: "logistiqueRef", type: "String", isOptionnal: false },
            { name: "societeCode", type: "String", isOptionnal: false },
            { name: "username", type: "String", isOptionnal: false }
          ],
        )),
        variables: { devalexpRef, logistiqueRef, societeCode, username },
        fetchPolicy: "network-only",
      })

}
