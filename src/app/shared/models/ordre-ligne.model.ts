import { Model, Field } from './model';
import { Article } from './article.model';
import { Ordre } from './ordre.model';

export class OrdreLigne extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: Ordre}) public ordre: Ordre;
  @Field({model: Article}) public article: Article;

}
