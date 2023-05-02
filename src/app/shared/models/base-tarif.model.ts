import { Field, Model, ModelName } from "./model";

@ModelName("BaseTarif")
export class BaseTarif extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ allowSearch: false, allowHeaderFiltering: false })
  public cku: string;
  @Field() public valideTrp: boolean;
  @Field() public valideLig: boolean;
  @Field() public valide: boolean;
}

export default BaseTarif;
