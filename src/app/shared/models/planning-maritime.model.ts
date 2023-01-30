import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";
import Pays from "./pays.model";

@ModelName("PlanningMaritime")
export class PlanningMaritime extends Model {
  @Field({ asKey: true }) id: number;
  @Field() heureDepartPrevueFournisseur: string;
  @Field({ dataType: "localdate" }) dateDepartPrevueFournisseur: string;
  @Field({ dataType: "datetime" }) dateLivraisonPrevue: string;
  @Field() nombrePalettesCommandees: number;
  @Field() codeFournisseur: string;
  @Field() codeClient: string;
  @Field() codeEntrepot: string;
  @Field() raisonSocial: string;
  @Field() ville: string;
  @Field({ model: import("./pays.model") }) public pays: Pays;
  @Field() numeroOrdre: string;
  @Field() referenceLogistique: string;
  @Field() referenceLogistiqueComplete: string;
  @Field({ model: import("./ordre.model") }) public ordre: Ordre;
}

export default PlanningMaritime;
