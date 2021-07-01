import { Field, Model, ModelName } from './model';

@ModelName('Frais')
export class Frais extends Model {

  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public description?: string;

}

export default Frais;
