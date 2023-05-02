import { Field, Model, ModelName } from "./model";

@ModelName("Frais")
export class Frais extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field() public dateModification: Date;
  @Field() public userModification: string;
  @Field() public valide: boolean;
}

export default Frais;
