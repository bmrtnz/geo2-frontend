import { Model, Field } from './model';
import { Article } from './article.model';
import { Ordre } from './ordre.model';

export class OrdreLigne extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: import('./ordre.model')}) public ordre: Ordre;
  @Field({model: import('./article.model')}) public article: Article;

}

export default OrdreLigne;
