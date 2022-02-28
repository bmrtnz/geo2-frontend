import { Field, Model, ModelName } from "./model";

@ModelName("RegimeTva")
export class RegimeTva extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field() public valide: boolean;
}

export default RegimeTva;
