import { Model, Field } from './model';

export class ModeCulture extends Model {
  @Field({asKey: true}) public id: number;
  @Field({asLabel: true}) public description: string;
}

export default ModeCulture;
