import { Field, Model, ModelName } from "./model";
import Societe from "./societe.model";
import { Utilisateur } from "./utilisateur.model";

@ModelName("GridConfig")
export class GridConfig extends Model {
  @Field({ asKey: true, model: import("./utilisateur.model") })
  public utilisateur: Utilisateur;
  @Field({ model: import("./societe.model") })
  public societe: Societe;
  @Field({ asKey: true, asLabel: true }) public grid: string;
  @Field() public config: any;
}

export default GridConfig;
