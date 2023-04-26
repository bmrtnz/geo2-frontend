import { Field, Model, ModelName } from "./model";

@ModelName("Instruction")
export class Instruction extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field() public userModificationString?: string;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field() public valide?: boolean;
}

export default Instruction;
