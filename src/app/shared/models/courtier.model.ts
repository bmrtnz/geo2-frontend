import { Model, Field } from './model';

export class Courtier extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public valide: boolean;

}

export default Courtier;
