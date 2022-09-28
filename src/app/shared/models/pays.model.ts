import { Field, Model, ModelName } from "./model";
import Secteur from "./secteur.model";

@ModelName("Pays")
export class Pays extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public numeroIso: string;
  @Field() public valide: boolean;
  @Field({ model: import("./secteur.model") }) public secteur: Secteur;
}

export default Pays;
