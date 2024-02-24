import { Field, Model, ModelName } from "./model";
import Variete from "./variete.model";

@ModelName("VarieteTraduction")
export class VarieteTraduction extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public langue: string;
  @Field() public valide: boolean;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public userModification?: string;
  @Field({ model: import("./variete.model") }) public variete: Variete;
}

export default VarieteTraduction;
