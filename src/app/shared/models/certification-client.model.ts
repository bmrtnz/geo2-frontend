import Certification from "./certification.model";
import Client from "./client.model";
import { Field, Model, ModelName } from "./model";

@ModelName("CertificationClient")
export class CertificationClient extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field({ model: import("./certification.model") })
  public certification?: Certification;
}

export default CertificationClient;
