import { Field, Model, ModelName } from "./model";

@ModelName("Certification")
export class Certification extends Model {

  @Field({ asKey: true }) public id: number;
  @Field({ asLabel: true }) public description?: string;
  @Field() public maskTiers?: string;
  @Field() public valide?: boolean;

}

export default Certification;
