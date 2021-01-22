import Article from './article.model';
import Historique from './historique.model';
import {Field, ModelName} from './model';

@ModelName('HistoriqueArticle')
export class HistoriqueArticle extends Historique {
  @Field({model: import('./article.model')}) public article: Article;
}

export default HistoriqueArticle;
