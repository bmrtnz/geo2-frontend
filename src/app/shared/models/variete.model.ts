import { Field, Model, ModelName } from "./model";
import GroupeVariete from "./groupe-variete.model";
import StockArticleAge from "./stock-article-age.model";

@ModelName("Variete")
export class Variete extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field() public modificationDetail: boolean;
  @Field({ model: import("./stock-article-age.model") }) public stocksAge: StockArticleAge[];
  @Field({ model: import("./groupe-variete.model") }) public groupe: GroupeVariete[];
}

export default Variete;
