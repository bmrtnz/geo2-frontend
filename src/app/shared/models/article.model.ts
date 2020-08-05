import { Model, Field } from './model';
import { ArticleMatierePremiere } from './article-matiere-premiere.model';
import { ArticleCahierDesCharges } from './article-cahier-des-charges.model';
import { ArticleNormalisation } from './article-normalisation.model';
import { ArticleEmballage } from './article-emballage.model';

export class Article extends Model {
  @Field({asKey: true}) public id: string;
  @Field({model: ArticleMatierePremiere}) public matierePremiere: ArticleMatierePremiere;
  @Field({asLabel: true}) public description: string;
  @Field() public blueWhaleStock: boolean;
  @Field({model: ArticleCahierDesCharges}) public cahierDesCharge: ArticleCahierDesCharges;
  @Field({model: ArticleNormalisation}) public normalisation: ArticleNormalisation;
  @Field() public valide: boolean;
  @Field({model: ArticleEmballage}) public emballage: ArticleEmballage;
}
