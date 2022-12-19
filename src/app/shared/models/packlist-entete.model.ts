import { Field, Model, ModelName } from "./model";
import PacklistOrdre from "./packlist-ordre.model";

@ModelName("PacklistEntete")
export class PacklistEntete extends Model {
    @Field({ asKey: true }) id: number;
    @Field({ dataType: "datetime" }) depart: string;
    @Field({ dataType: "datetime" }) livraison: string;
    @Field({ dataType: "datetime" }) impression: string;
    @Field() numeroPo: string;
    @Field() mail: string;
    @Field() cliEnt: boolean;
    @Field() traite: boolean;
    @Field({ model: import("./packlist-ordre.model") }) ordres: PacklistOrdre[];
}

export default PacklistEntete;
