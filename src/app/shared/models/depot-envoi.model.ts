import { Field, Model, ModelName } from "./model";
import { Ordre } from "./ordre.model";
import Utilisateur from "./utilisateur.model";

@ModelName("DepotEnvoi")
export class DepotEnvoi extends Model {
  @Field({ asKey: true }) public id: number;
  @Field({ model: import("./ordre.model") }) public ordre: Partial<Ordre>;
  @Field({ dataType: "datetime " }) public dateDepot: string;
  @Field() public fluxID: string;
  @Field() public mailUtilisateur: string;
}

export default DepotEnvoi;
