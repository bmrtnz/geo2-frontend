import { Field, Model, ModelName } from "./model";

@ModelName("TypeCamion")
export class TypeCamion extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field() public valide: boolean;
}

export default TypeCamion;
