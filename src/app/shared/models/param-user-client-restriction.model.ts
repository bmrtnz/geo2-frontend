import { Field, Model, ModelName } from "./model";
import { Client } from "./client.model";
import { Entrepot } from "./entrepot.model";

@ModelName("ParamUserClientRestriction")
export class ParamUserClientRestriction extends Model {
  @Field({ asKey: true }) public id: number;
  @Field() public nomUtilisateur: string;
  @Field({ model: import("./client.model") }) public client: Client;
  @Field({ model: import("./entrepot.model") }) public entrepot: Entrepot;
}

export default ParamUserClientRestriction;
