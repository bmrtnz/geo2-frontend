import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";

@ModelName("CodePromo")
export class CodePromo extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public userModification: string;
  @Field() public valide: boolean;
}

export default CodePromo;
