import Devise from "./devise.model";
import Frais from "./frais.model";
import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";

@ModelName("OrdreFrais")
export class OrdreFrais extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field({ model: import("./frais.model") }) public frais?: Frais;
  @Field({ model: import("./devise.model") }) public devise?: Devise;
  @Field() public montant?: number;
  @Field() public deviseTaux?: number;
  @Field() public codePlus?: string;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field() public achatQuantite?: number;
  @Field() public achatPrixUnitaire?: number;
  @Field() public achatDevisePrixUnitaire?: number;
  @Field() public montantTotal?: number;
  @Field() public valide?: string;
}

export default OrdreFrais;
