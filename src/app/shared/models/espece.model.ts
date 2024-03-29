import { Field, Model, ModelName } from "./model";

@ModelName("Espece")
export class Espece extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
}

export default Espece;
