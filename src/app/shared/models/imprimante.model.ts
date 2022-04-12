import { Field, Model, ModelName } from "./model";

@ModelName("Imprimante")
export class Imprimante extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public reference?: string;
  @Field() public nomLocal?: string;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public ipv4?: string;
  @Field() public valide?: boolean;
}

export default Imprimante;
