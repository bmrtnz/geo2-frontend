import {Field, Model, ModelName} from './model';

@ModelName('Departement')
export class Departement extends Model {
  @Field({asKey: true}) public id: number;
  @Field({asLabel: true}) public libelle: string;
  @Field() public userModification?: string;
  @Field() public numero?: string;
  @Field({ dataType: 'localdate' }) public dateModification?: string;
}

export default Departement;

