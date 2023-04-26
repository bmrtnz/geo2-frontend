import { Field, Model, ModelName } from "./model";

@ModelName("MoyenCommunication")
export class MoyenCommunication extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
}

export default MoyenCommunication;
