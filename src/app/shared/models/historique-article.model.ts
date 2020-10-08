import Article from './article.model';
import Historique from './historique.model';
import { Field } from './model';

export class HistoriqueArticle extends Historique {
  @Field({model: import('./article.model')}) public article: Article;
}

export default HistoriqueArticle;
