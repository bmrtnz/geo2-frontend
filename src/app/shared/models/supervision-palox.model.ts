import { Field, Model, ModelName } from "./model";

@ModelName("SupervisionPalox")
export class SupervisionPalox extends Model {
    @Field({ asKey: true }) id: number;
    @Field({ asLabel: true }) codeEntrepot: string;
    @Field() codeClient: string;
    @Field() raisonSocialeEntrepot: string;
    @Field() codePostalEntrepot: string;
    @Field() villeEntrepot: string;
    @Field() codePaysEntrepot: string;
    @Field() codeEmballage: string;
    @Field() codeFournisseur: string;
    @Field() raisonSocialeFournisseur: string;
    @Field({ dataType: "datetime" }) dateInventaire: string;
    @Field() quantiteInventaire: number;
    @Field() codeEspece: string;
    @Field() referenceEntrepot: string;
    @Field() sommeQuantiteInventaire: number;
    @Field() entree: number;
    @Field() sortie: number;
}

export default SupervisionPalox;
