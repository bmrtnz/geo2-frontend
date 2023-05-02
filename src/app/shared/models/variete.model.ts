import { Field, Model, ModelName } from "./model";
import StockArticleAge from "./stock-article-age.model";

@ModelName("Variete")
export class Variete extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public modificationDetail: boolean;
  @Field({ model: import("./stock-article-age.model") })
  public stocksAge: StockArticleAge[];
}

export default Variete;
