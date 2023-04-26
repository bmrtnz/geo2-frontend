import { Field, Model, ModelName } from "./model";

@ModelName("CertificationModeCulture")
export class CertificationModeCulture extends Model {
  @Field({ asKey: true }) public id: number;
  @Field({ asLabel: true }) public description: string;
  @Field() public type?: string;
}

export default CertificationModeCulture;
