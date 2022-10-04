import Client from "./client.model";
import { Field, Model, ModelName } from "./model";

@ModelName("ClientEdi")
export class ClientEdi extends Model {
  @Field({ asKey: true }) public id: number;
  @Field({ asLabel: true }) public code: string;
  @Field({ model: import("./client.model") }) public client: Client;
}

export default ClientEdi;
