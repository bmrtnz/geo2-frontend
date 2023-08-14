import Article from "./article.model";
import Client from "./client.model";
import { Field, Model, ModelName } from "./model";

@ModelName("ArticleStatistiqueClient ")
export class ArticleStatistiqueClient extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ model: import("./article.model") }) public article?: Article;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field() public expeditionNbColis?: number;
  @Field() public expeditionPoidsNet?: number;
  @Field() public numeroOrdre?: string;
}

export default ArticleStatistiqueClient;
