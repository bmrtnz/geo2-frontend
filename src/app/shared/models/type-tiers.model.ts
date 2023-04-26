import { Field, Model, ModelName } from "./model";

@ModelName("TypeTiers")
export class TypeTiers extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public responsableLitige: boolean;
  @Field() public userModification: string;
  @Field() public dateModification: Date;
  @Field() public valide: boolean;
}

export default TypeTiers;
