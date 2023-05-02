import { Field, Model, ModelName } from "./model";

@ModelName("Historique")
export class Historique extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public commentaire: string;
  @Field() public valide: boolean;
  @Field() public userModification: string;
  @Field() public dateModification: Date;
}

export default Historique;
