import { Field, Model, ModelName } from "./model";
import OrdreLogistique from "./ordre-logistique.model";

@ModelName("PlanningDepart")
export class PlanningDepart extends Model {
  @Field({ asKey: true }) id: number;
  @Field() sommeColisCommandes: number;
  @Field() sommeColisExpedies: number;
  @Field({ model: import("./ordre-logistique.model") }) public ordreLogistique: OrdreLogistique;
}

export default PlanningDepart;
