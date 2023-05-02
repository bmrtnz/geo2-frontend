import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";

@ModelName("IdentificationSymbolique")
export class IdentificationSymbolique extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ dataType: "localdate" }) public dateModification?: string;
  @Field() public descriptionClient: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field() public userModification: string;
  @Field() public valide?: boolean;
  get especeId() {
    return this.espece.id;
  }
}

export default IdentificationSymbolique;
