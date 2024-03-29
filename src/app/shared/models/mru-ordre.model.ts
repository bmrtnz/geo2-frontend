import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";
import Societe from "./societe.model";
import Utilisateur from "./utilisateur.model";

@ModelName("MRUOrdre")
export class MRUOrdre extends Model {
  @Field({ asKey: true, asLabel: true }) public numero: string;
  @Field() public ordreRef: string;
  @Field({ model: import("./ordre.model") }) public ordre: Ordre;
  @Field({ model: import("./utilisateur.model") })
  public utilisateur: Utilisateur;
  @Field({ model: import("./societe.model") }) public societe: Societe;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public nomUtilisateur: string;
  @Field() public socCode: string;
  @Field() public cenCode: string;
}

export default MRUOrdre;
