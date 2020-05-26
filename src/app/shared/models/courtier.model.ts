import { Model, Field } from './model';

export class Courtier extends Model {

  @Field() public id: string;
  @Field() public raisonSocial: string;
  @Field() public valide: boolean;

}
