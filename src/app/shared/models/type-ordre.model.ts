import { Field, Model, ModelName } from "./model";

@ModelName("TypeOrdre")
export class TypeOrdre extends Model {
    @Field({ asKey: true }) public id?: string;
    @Field({ asLabel: true }) public description?: string;
}

export default TypeOrdre;
