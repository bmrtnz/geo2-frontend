import { Field, Model } from './model';

export class Pays extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public numeroIso: string;
  @Field() public valide: boolean;

}
