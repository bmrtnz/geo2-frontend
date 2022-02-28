import { Field, Model, ModelName } from "./model";

@ModelName("Variete")
export class Variete extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
}

export default Variete;
