import { Field, Model } from './model';

export class Alveole extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
}
