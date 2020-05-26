import { Model, Field } from './model';

export class Incoterm extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public renduDepart: string;
  @Field() public lieu: boolean;
  @Field() public valide: boolean;

}
