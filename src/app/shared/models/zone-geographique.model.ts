import {Field, Model, ModelName} from './model';

@ModelName('ZoneGeographique')
export class ZoneGeographique extends Model {
  @Field({asKey: true}) public id: number;
  @Field({asLabel: true}) public libelle: string;
  @Field() public userModification?: string;
  @Field({ dataType: 'localdate' }) public dateModification?: string;
}

export default ZoneGeographique;

