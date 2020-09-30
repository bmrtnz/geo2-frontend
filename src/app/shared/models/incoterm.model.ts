import { Model, Field } from './model';

export class Incoterm extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public renduDepart: string;
  @Field() public lieu: boolean;
  @Field() public valide: boolean;

}

export default Incoterm;
