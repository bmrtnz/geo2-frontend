import { Field, Model, ModelName } from "./model";

@ModelName("Incoterm")
export class Incoterm extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field({ allowSearch: false, allowHeaderFiltering: false })
    public renduDepart: string;
    @Field() public lieu: boolean;
    @Field() public valide: boolean;
}

export default Incoterm;
