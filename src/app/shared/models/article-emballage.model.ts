import { Model, Field } from './model';
import { Emballage } from './emballage.model';
import { ConditionSpecial } from './condition-special.model';
import { Alveole } from './alveole.model';
import { Espece } from './espece.model';

export class ArticleEmballage extends Model {
  @Field({asKey: true, asLabel: true}) public id: string;
  @Field({model: import('./espece.model')}) public espece: Espece;
  @Field({model: import('./emballage.model')}) public emballage: Emballage;
  @Field({model: import('./condition-special.model')}) public conditionSpecial:
  ConditionSpecial;
  @Field({model: import('./alveole.model')}) public alveole: Alveole;
  @Field() public uniteParColis: number;
  @Field() public poidsNetColis: number;
  @Field() public poidsNetGaranti: number;
  @Field() public prepese: boolean;
}

export default ArticleEmballage;
