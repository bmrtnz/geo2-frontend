import Frais from "./frais.model";
import Litige from "./litige.model";
import { Field, Model, ModelName } from "./model";

@ModelName("OrdreFraisLitige")
export class OrdreFraisLitige extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field({ model: import("./frais.model") }) public frais?: Frais;
  public montant?: number;
  @Field() public transporteurCodePlus?: string;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field({ model: import("./litige.model") }) public litige?: Litige;
  @Field() public valide?: string;
}

export default OrdreFraisLitige;
