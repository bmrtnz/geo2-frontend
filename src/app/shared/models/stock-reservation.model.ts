import { Field, Model, ModelName } from "./model";

@ModelName("StockReservation")
export class StockReservation extends Model {

  @Field({ asKey: true })
  id: number;

  @Field()
  fournisseurCode: string;

  @Field()
  proprietaireCode: string;

  @Field()
  typePaletteCode: string;

  @Field()
  option: string;

  @Field()
  quantiteInitiale: number;

  @Field()
  quantiteReservee: number;

  @Field()
  quantiteInitiale1: number;

  @Field()
  quantiteReservee1: number;

  @Field()
  quantiteInitiale2: number;

  @Field()
  quantiteReservee2: number;

  @Field()
  quantiteInitiale3: number;

  @Field()
  quantiteReservee3: number;

  @Field()
  quantiteInitiale4: number;

  @Field()
  quantiteReservee4: number;
}

export default StockReservation;
