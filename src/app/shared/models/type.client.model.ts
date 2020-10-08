import { Model, Field } from './model';

export class TypeClient extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public valide: boolean;

}

export default TypeClient;
