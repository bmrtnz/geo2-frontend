import { Field, Model } from './model';

export class Secteur extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public valide: boolean;

}
