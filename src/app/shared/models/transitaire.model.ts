import { Field, Model } from './model';

export class Transitaire extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public valide: boolean;
}

export default Transitaire;
