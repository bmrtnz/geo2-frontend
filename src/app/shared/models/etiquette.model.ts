import {Field, Model, ModelName} from './model';

@ModelName('Etiquette')
export class Etiquette extends Model {
  @Field({asKey: true}) public isPresent: boolean;
  @Field({asLabel: true}) public filename: string;
}

export default Etiquette;
