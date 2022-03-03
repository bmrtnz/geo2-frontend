import { Pays } from "./pays.model";
import { Field, Model, ModelName } from "./model";

export enum Type {
    PORT_DE_DEPART = "D",
    PORT_D_ARRIVEE = "A",
}
@ModelName("Port")
export class Port extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public name: string;
    @Field({ dataType: "datetime" }) public dateModification?: string;
    // @Field({model: import('./pays.model')}) public pays: Pays;
    @Field({ allowHeaderFiltering: false, allowSearch: false })
    public type?: Type;
    @Field() public typeTiers: string;
    @Field() public universalLocationCode: string;
    @Field() public userModification?: string;
    @Field() public valide: boolean;
}

export default Port;
