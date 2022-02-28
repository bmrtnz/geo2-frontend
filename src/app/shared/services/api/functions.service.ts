import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { ApiService } from "../api.service";

export type FunctionResponse = {
    res: number;
    msg?: string;
    data?: Record<string, any>;
};
const body = ["res", "msg", "data"];

@Injectable({
    providedIn: "root",
})
export class FunctionsService {
    constructor(private apollo: Apollo) {}

    /**
     * Vérifie si la création de l'ordre pour l'entrepot est autorisé
     */
    public ofValideEntrepotForOrdre = (entrepotID: string) =>
        this.apollo.watchQuery<{ ofValideEntrepotForOrdre: FunctionResponse }>({
            query: gql(
                ApiService.buildGraph(
                    "query",
                    [
                        {
                            name: "ofValideEntrepotForOrdre",
                            body,
                            params: [
                                {
                                    name: "entrepotID",
                                    value: "entrepotID",
                                    isVariable: true,
                                },
                            ],
                        },
                    ],
                    [
                        {
                            name: "entrepotID",
                            type: "String",
                            isOptionnal: false,
                        },
                    ],
                ),
            ),
            variables: { entrepotID },
            fetchPolicy: "network-only",
        })

    /**
     * Genere un nouvel ordre pour une société
     */
    public fNouvelOrdre = (societe: string) =>
        this.apollo.watchQuery<{ fNouvelOrdre: FunctionResponse }>({
            query: gql(
                ApiService.buildGraph(
                    "query",
                    [
                        {
                            name: "fNouvelOrdre",
                            body,
                            params: [
                                {
                                    name: "societe",
                                    value: "societe",
                                    isVariable: true,
                                },
                            ],
                        },
                    ],
                    [{ name: "societe", type: "String", isOptionnal: false }],
                ),
            ),
            variables: { societe },
            fetchPolicy: "network-only",
        })

    /**
     * Génère une nouvelle ligne d'ordre avec l'article sélectionné.
     */
    public ofInitArticle = (
        ordreRef: string,
        articleRef: string,
        societeCode: string,
    ) =>
        this.apollo.watchQuery<{ ofInitArticle: FunctionResponse }>({
            query: gql(
                ApiService.buildGraph(
                    "query",
                    [
                        {
                            name: "ofInitArticle",
                            body,
                            params: [
                                {
                                    name: "ordreRef",
                                    value: "ordreRef",
                                    isVariable: true,
                                },
                                {
                                    name: "ordreRef",
                                    value: "ordreRef",
                                    isVariable: true,
                                },
                                {
                                    name: "societeCode",
                                    value: "societeCode",
                                    isVariable: true,
                                },
                            ],
                        },
                    ],
                    [
                        {
                            name: "ordreRef",
                            type: "String",
                            isOptionnal: false,
                        },
                        {
                            name: "articleRef",
                            type: "String",
                            isOptionnal: false,
                        },
                        {
                            name: "societeCode",
                            type: "String",
                            isOptionnal: false,
                        },
                    ],
                ),
            ),
            variables: { ordreRef, articleRef, societeCode },
            fetchPolicy: "network-only",
        })
}
