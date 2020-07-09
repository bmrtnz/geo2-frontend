import { Model, Field } from './model';
import { Emballage } from './emballage.model';
import { ConditionSpecial } from './condition-special.model';
import { Alveole } from './alveole.model';

export class ArticleEmballage extends Model {
  @Field({asKey: true, asLabel: true}) public id: string;
  @Field({model: Emballage}) public emballage: Emballage;
  @Field({model: ConditionSpecial}) public conditionSpecial:
  ConditionSpecial;
  @Field({model: Alveole}) public alveole: Alveole;
  @Field() public uniteParColis: number;
  @Field() public poidsNetColis: number;
  @Field() public poidsNetGaranti: number;
  @Field() public prepese: boolean;
}
