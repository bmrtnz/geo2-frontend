import { Field, Model, ModelName } from "./model";

@ModelName("StockQuantite")
export abstract class StockQuantite extends Model {

  @Field()
  quantiteInitiale1: number;

  @Field()
  quantiteReservee1: number;

  @Field()
  quantiteOptionnelle1: number;

  @Field()
  quantiteCalculee1: number;

  @Field()
  quantiteInitiale2: number;

  @Field()
  quantiteReservee2: number;

  @Field()
  quantiteOptionnelle2: number;

  @Field()
  quantiteCalculee2: number;

  @Field()
  quantiteInitiale3: number;

  @Field()
  quantiteReservee3: number;

  @Field()
  quantiteOptionnelle3: number;

  @Field()
  quantiteCalculee3: number;

  @Field()
  quantiteInitiale4: number;

  @Field()
  quantiteReservee4: number;

  @Field()
  quantiteOptionnelle4: number;

  @Field()
  quantiteCalculee4: number;
}

export default StockQuantite;
