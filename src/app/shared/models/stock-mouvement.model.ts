import Article from "./article.model";
import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";
import Ordre from "./ordre.model";
import Stock from "./stock.model";

@ModelName("StockMouvement")
export class StockMouvement extends Model {
  @Field({ asKey: true }) id: string;
  @Field({ asKey: true }) description: string;
  @Field({ model: import("./stock.model") }) stock: Stock;
  @Field({ model: import("./ordre.model") }) ordre: Ordre;
  @Field({ model: import("./ordre-ligne.model") }) ordreLigne: OrdreLigne;
  @Field({ model: import("./article.model") }) article: Article;
  @Field() quantite: number;
  @Field() type: string;
  @Field() nomUtilisateur: string;
}

export default StockMouvement;
