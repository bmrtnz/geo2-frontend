import { Model, Field } from './model';

export class RegimeTva extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public valide: boolean;

}
