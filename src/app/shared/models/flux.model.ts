import { Model, Field } from './model';

export class Flux extends Model {
  @Field() public id: string;
  @Field() public description: string;
}
