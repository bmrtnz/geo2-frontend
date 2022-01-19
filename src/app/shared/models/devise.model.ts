import { Field, Model, ModelName } from './model';

@ModelName('Devise')
export class Devise extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public taux: number;
  @Field() public tauxAchat: number;
  @Field() public valide: boolean;

}

export default Devise;
