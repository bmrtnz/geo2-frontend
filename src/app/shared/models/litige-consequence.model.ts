import { Field, Model, ModelName } from './model';


@ModelName('LitigeConsequence')
export class LitigeConsequence extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({ dataType: 'datetime' }) public dateModification?: string;
  @Field() public userModification?: string;
  @Field() public valide?: boolean;
}

export default LitigeConsequence;