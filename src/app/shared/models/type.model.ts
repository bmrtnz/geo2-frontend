import {Field, Model, ModelName} from './model';

@ModelName('Type')
export class Type extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
}

export default Type;
