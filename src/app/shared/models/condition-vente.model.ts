import { Field, Model, ModelName } from "./model";

@ModelName("ConditionVente")
export class ConditionVente extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
}

export default ConditionVente;
