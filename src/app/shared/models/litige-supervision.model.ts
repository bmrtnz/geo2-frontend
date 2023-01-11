import { Fournisseur, Societe } from ".";
import Litige from "./litige.model";
import { Field, Model, ModelName } from "./model";
import Personne from "./personne.model";
import Secteur from "./secteur.model";

@ModelName("LitigeSupervision")
export class LitigeSupervision extends Model {
  @Field({ asKey: true }) id: number;
  @Field({ model: import("./secteur.model") }) secteurCommercial: Secteur;
  @Field({ model: import("./personne.model") }) personne: Personne;
  @Field() nomPersonne: string;
  @Field() prenomPersonne: string;
  @Field({ model: import("./litige.model") }) litige: Litige;
  @Field({ dataType: "datetime" }) dateCreationLitige: string;
  @Field() codeClient: string;
  @Field() descriptionVariete: string;
  @Field() numeroOrdre: string;
  @Field({ dataType: "datetime" }) dateDepartPrevueFournisseur: string;
  @Field({ model: import("./fournisseur.model") }) proprietaire: Fournisseur;
  @Field({ model: import("./fournisseur.model") }) fournisseur: Fournisseur;
  @Field() descriptionCause: string;
  @Field() descriptionConsequence: string;
  @Field() clientClos: boolean;
  @Field() fournisseurClos: boolean;
  @Field() numeroOrdreRemplacement: string;
  @Field() delai: number;
  @Field() fraisAnnexesLitige: number;
  @Field() prixClient: number;
  @Field() prixFourni: number;
  @Field({ model: import("./societe.model") }) societe: Societe;
  @Field() commentaireLigneLitige: string;
  @Field() container: string;
  @Field() immatriculation: string;
  @Field() codeChargement: string;
}

export default LitigeSupervision;
