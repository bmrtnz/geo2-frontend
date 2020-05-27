import { Model, Field } from './model';

export class MoyenPaiement extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public valide: boolean;

}
