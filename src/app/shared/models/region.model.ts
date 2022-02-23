import {Field, Model, ModelName} from './model';

@ModelName('Region')
export class Region extends Model {
  @Field({asKey: true}) public id: number;
  @Field({asLabel: true}) public libelle: string;
  @Field() public userModification?: string;
  @Field({ dataType: 'localdate' }) public dateModification?: string;
}

export default Region;

