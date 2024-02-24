import { Field, Model, ModelName } from "./model";
import Pays from "./pays.model";

@ModelName("PaysTraduction")
export class PaysTraduction extends Model {
  @Field({ model: import("./pays.model") }) public pays: Pays;
  @Field() public langue: string;
  @Field({ asLabel: true }) public description: string;
}

export default PaysTraduction;
