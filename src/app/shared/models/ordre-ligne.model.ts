import {Field, Model, ModelName} from './model';
import {Article} from './article.model';
import {Ordre} from './ordre.model';
import Fournisseur from './fournisseur.model';

@ModelName('OrdreLigne')
export class OrdreLigne extends Model {

  @Field({asKey: true, asLabel: true}) public id: string;
  @Field({model: import('./ordre.model')}) public ordre: Ordre;
  @Field({model: import('./article.model')}) public article: Article;
  @Field({model: import('./fournisseur.model')}) public fournisseur: Fournisseur;

}

export default OrdreLigne;
