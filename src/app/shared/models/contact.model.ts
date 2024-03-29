import { Flux } from "./flux.model";
import { Societe } from "./societe.model";
import { TypeTiers } from "./tier.model";
import { MoyenCommunication } from "./moyen-communication.model";
import { Field, Model, ModelName } from "./model";
import Client from "./client.model";
import Entrepot from "./entrepot.model";

@ModelName("Contact")
export class Contact extends Model {
  @Field({ model: import("./moyen-communication.model") })
  public moyenCommunication: MoyenCommunication;
  @Field({ model: import("./flux.model") }) public flux: Flux;
  @Field({
    validationRules: [
      {
        type: "stringLength",
        max: 6,
      },
    ],
  })
  public fluxComplement: string;
  @Field() public fluxAccess1: string;
  @Field({ asLabel: true }) public nom: string;
  @Field() public prenom: string;
  @Field() public valide: boolean;
  // @Field() public fluxAccess2: string;
  @Field({ model: import("./societe.model") }) public societe: Societe;
  @Field({ asKey: true, allowEditing: false }) public id: string;
  @Field({ allowEditing: false }) public codeTiers: string;
  @Field({ allowEditing: false }) public typeTiers: TypeTiers | string;
  @Field() public refClientEntrepot: string;
  @Field({ model: import("./client.model") }) public client: Client;
  @Field({ model: import("./entrepot.model") }) public entrepot: Entrepot;
}

export default Contact;
