import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";
import StockArticleAge from "./stock-article-age.model";

@ModelName("Origine")
export class Origine extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./stock-article-age.model") })
  public stocksAge: StockArticleAge[];
  @Field({ model: import("./espece.model") }) public espece: Espece;
  get especeId() {
    return this.espece.id;
  }
}

export default Origine;
