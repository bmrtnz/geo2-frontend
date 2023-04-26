import { Field, Model, ModelName } from "./model";

@ModelName("CodifDevalexp")
export class CodifDevalexp extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field() public numTri?: number;
}

export default CodifDevalexp;
