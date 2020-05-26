import { Model, Field } from './model';

export class TypeFournisseur extends Model {

  @Field() public id: string;
  @Field() public description: string;
  @Field() public valide: boolean;

}
