import { Model, Field } from './model';

export class TypeClient extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public valide: boolean;

}
