import {Field, Model, ModelName} from './model';

@ModelName('Pays')
export class Pays extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public numeroIso: string;
  @Field() public valide: boolean;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public sommeAgrement: number;

}

export default Pays;
