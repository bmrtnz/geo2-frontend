import { Field, Model, ModelName } from "./model";

@ModelName("StockConsolide")
export class StockConsolide extends Model {

  @Field({ asKey: true }) private id: string;
  @Field() private commentaire: string;

}
