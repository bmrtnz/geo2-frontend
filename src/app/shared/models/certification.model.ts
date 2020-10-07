import { Model, Field } from './model';

export class Certification extends Model {

  @Field({asKey: true}) public id: number;
  @Field({asLabel: true}) public description: string;
  @Field() public valide: boolean;

}

export default Certification;
