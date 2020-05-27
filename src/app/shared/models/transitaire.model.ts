import { Field, Model } from './model';

export class Transitaire extends Model {
  @Field() public id: string;
  @Field() public raisonSocial: string;
  @Field() public valide: boolean;
}
