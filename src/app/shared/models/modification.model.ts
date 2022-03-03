import { Field, Model, ModelName } from "./model";
import { Utilisateur } from "./utilisateur.model";
import { ModificationCorps } from "./";

@ModelName("Modification")
export class Modification extends Model {
    @Field({ asKey: true }) public id: number;
    @Field({ dataType: "datetime" }) public dateModification?: string;
    @Field() public entite: string;
    @Field() public entiteID: string;
    @Field({ model: import("./utilisateur.model") })
    public initiateur: Utilisateur;
    @Field({ model: import("./modification-corps.model") })
    public corps: ModificationCorps[];
    @Field() public statut: boolean;
}

export default Modification;
