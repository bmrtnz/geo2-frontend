import { Field, Model, ModelName } from "./model";

@ModelName("LitigeAPayer")
export class LitigeAPayer extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public raisonSociale: string;
  @Field() public type?: string;
  @Field() public codeFournisseur?: string;
  @Field() public numeroTri?: number;
}

export default LitigeAPayer;
