import { Model, Field } from './model';

export class MoyenCommunication extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
}
