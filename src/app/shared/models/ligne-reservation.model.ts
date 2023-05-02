import { Field, Model, ModelName } from "./model";

@ModelName("LigneReservation")
export class LigneReservation extends Model {
  @Field({ asKey: true })
  id: string;

  @Field()
  stockId: string;

  @Field()
  nomUtilisateur: string;

  @Field()
  type: string;

  @Field()
  quantite: number;

  @Field()
  ordreId: string;

  @Field()
  articleId: string;

  @Field()
  ordreLigneId: string;

  @Field()
  mouvementDescription: string;

  @Field()
  ligneFournisseurCode: string;

  @Field()
  fournisseurCode: string;

  @Field()
  proprietaireCode: string;

  @Field()
  stockDescription: string;

  @Field()
  quantiteInitiale: number;

  @Field()
  quantiteReservee: number;

  @Field()
  typePalette: string;
}

export default LigneReservation;
