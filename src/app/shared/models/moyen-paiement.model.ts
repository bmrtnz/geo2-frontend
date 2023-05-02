import { Field, Model, ModelName } from "./model";

@ModelName("MoyenPaiement")
export class MoyenPaiement extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public valide: boolean;
}

export default MoyenPaiement;
