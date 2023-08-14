import Article from "./article.model";
import Fournisseur from "./fournisseur.model";
import { Field, Model, ModelName } from "./model";

@ModelName("ArticleStatistiqueFournisseur ")
export class ArticleStatistiqueFournisseur extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field({ model: import("./article.model") }) public article?: Article;
  @Field({ model: import("./fournisseur.model") }) public fournisseur?: Fournisseur;
  @Field() public expeditionNbColis?: number;
  @Field() public expeditionPoidsNet?: number;
  @Field() public nbOrdre?: number;
  @Field() public numeroOrdre?: string;
}

export default ArticleStatistiqueFournisseur;
