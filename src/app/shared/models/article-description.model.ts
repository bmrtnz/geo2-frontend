import Article from "./article.model";
import { Field, Model, ModelName } from "./model";

@ModelName("ArticleDescription")
export class ArticleDescription extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./article.model") }) public article: Article;
  @Field() public descriptionLongue: string;
  @Field() public descriptionReferenceLongue: string;
  @Field() public descriptionCourte: string;
  @Field() public descriptionReferenceCourte: string;
}

export default ArticleDescription;
