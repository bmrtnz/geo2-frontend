import { Model, Field } from './model';

export class Devise extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public taux: number;
  @Field() public tauxAchat: number;
  @Field() public valide: boolean;

}
