import { Field, Model } from './model';

export class Pays extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public numeroIso: string;
  @Field() public valide: boolean;

}
