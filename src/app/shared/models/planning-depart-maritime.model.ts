import { Field, Model, ModelName } from "./model";
import Pays from "./pays.model";

@ModelName("PlanningDepartMaritime")
export class PlanningDepartMaritime extends Model {
  @Field({ asKey: true }) id: number;
  @Field() dateDepartPrevueFournisseurRaw: string;
  @Field({ dataType: "localdate" }) dateDepartPrevueFournisseur: string;
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
}

export default PlanningDepartMaritime;
