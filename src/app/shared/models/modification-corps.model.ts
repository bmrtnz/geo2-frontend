import { Field, Model, ModelName } from "./model";
import { Utilisateur } from "./utilisateur.model";
import { Modification } from "./modification.model";

@ModelName("ModificationCorps")
export class ModificationCorps extends Model {
    @Field({ asKey: true }) public id: number;
    @Field() public affichageActuel: string;
    @Field() public affichageDemande: string;
    @Field({ dataType: "datetime" }) public dateModification?: string;
    @Field() public chemin: string;
    @Field({ model: import("./modification.model") })
    public modification: Modification;
    @Field() public traductionKey: string;
    @Field() public valeurActuelle: string;
    @Field() public valeurDemandee: string;
    @Field({ model: import("./utilisateur.model") })
    public validateur: Utilisateur;
}

export default ModificationCorps;
