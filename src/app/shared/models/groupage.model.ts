import { Field, Model, ModelName } from "./model";

@ModelName("Groupage")
export class Groupage extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public ville?: string;
}

export default Groupage;
