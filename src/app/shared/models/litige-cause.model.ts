import { Field, Model, ModelName } from "./model";

@ModelName("LitigeCause")
export class LitigeCause extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field() public userModification?: string;
  @Field() public indicateurRegularisation?: boolean;
  @Field() public valide?: boolean;
  @Field() public typeTier?: string;
  @Field() public numeroTri?: number;
  @Field({ dataType: "localdate" }) public dateFin?: string;
}

export default LitigeCause;
