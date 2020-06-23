import { Model, Field } from './model';

export class Type extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
}
