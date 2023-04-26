import { Ordre } from "./ordre.model";
import { Field, Model, ModelName } from "./model";
import { Entrepot } from "./entrepot.model";
import { Societe } from "./societe.model";
import Personne from "./personne.model";

@ModelName("MRUOrdre")
export class MRUOrdre extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ model: import("./societe.model") }) public societe?: Societe;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field({ asLabel: true }) public numero?: string;
  @Field() public referenceClient?: string;
  @Field({ model: import("./personne.model") }) public utilisateur?: Personne;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Entrepot;
}

export default MRUOrdre;
