import { Field, Model, ModelName } from "./model";

@ModelName("LigneReservation")
export class LigneReservation extends Model {

  @Field({ asKey: true })
  id: number;

  @Field()
  fournisseurCode: string;

  @Field()
  proprietaireCode: string;

  @Field()
  quantite: number;

}

export default LigneReservation;
