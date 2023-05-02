import { Field, Model, ModelName } from "./model";
import { MoyenCommunication } from "./moyen-communication.model";
import { TypeTiers } from "./tier.model";

@ModelName("ContactEnvois")
export class ContactEnvois extends Model {
  @Field({ asKey: true, allowEditing: false }) public id: string;
  @Field({ allowEditing: false }) public typeTiers: TypeTiers | string;
  @Field({ allowEditing: false }) public codeTiers: string;
  @Field({ model: import("./moyen-communication.model") })
  public moyenCommunication: MoyenCommunication;
  @Field() public fluxAccess1: string;
  @Field() public fluxAccess2: string;
  @Field({
    validationRules: [
      {
        type: "stringLength",
        max: 6,
      },
    ],
  })
  public fluxComplement: string;
  @Field() public prenom: string;
  @Field({ asLabel: true }) public nom: string;
  @Field() public fichierDot: string;
  @Field() public fichierMap: string;
}

export default ContactEnvois;
