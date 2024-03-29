import { Field, Model, ModelName } from "./model";

@ModelName("TypeVente")
export class TypeVente extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
}

export default TypeVente;
