import { Model, Field } from './model';

export class GroupeFournisseur extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
}


export default GroupeFournisseur;
