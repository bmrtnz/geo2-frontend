import Frais from "./frais.model";
import Litige from "./litige.model";
import { Field, Model, ModelName } from "./model";

@ModelName("FraisLitige")
export class FraisLitige extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./litige.model") }) public litige?: Litige;
  @Field({ model: import("./frais.model") }) public frais?: Frais;
  @Field() public montant?: number;
  @Field() public transporteurCodePlus?: string;
}

export default FraisLitige;
