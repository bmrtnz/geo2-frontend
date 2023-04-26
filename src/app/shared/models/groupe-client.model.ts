import { Field, Model, ModelName } from "./model";

@ModelName("GroupeClient")
export class GroupeClient extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public valide: boolean;
}

export default GroupeClient;
