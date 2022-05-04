import { Field, Model, ModelName } from "./model";
import Secteur from "./secteur.model";
import Personne from "./personne.model";
import ParamUserClientRestrictionModel from "./param-user-client-restriction.model";

@ModelName("Utilisateur")
export class Utilisateur extends Model {
    @Field({ asKey: true }) public nomUtilisateur?: string;
    @Field() public nomInterne?: string;
    @Field() public accessGeoTiers?: boolean;
    @Field() public accessGeoProduct?: boolean;
    @Field() public accessGeoOrdre?: boolean;
    @Field({ model: import("./param-user-client-restriction.model") })
    public restrictions?: ParamUserClientRestrictionModel[];
    @Field() public perimetre?: string;
    @Field() public geoClient?: string;
    @Field() public limitationSecteur?: boolean;
    @Field({ model: import("./secteur.model") })
    @Field() public indicateurVisualisationIncotermFournisseur?: boolean;
    public secteurCommercial?: Secteur;
    @Field({ model: import("./personne.model") }) public commercial?: Personne;
    @Field({ model: import("./personne.model") }) public assistante?: Personne;
    @Field({ model: import("./personne.model") }) public personne?: Personne;
    @Field() public configTuilesOrdres?: any;
    @Field() public configTabsOrdres?: { [key: string]: string };
    @Field() public adminClient?: boolean;
    @Field() public profileClient?: string;

    public getSUP?() {
        return (
            [this?.commercial, this?.assistante]
                .filter((person) => person?.indicateurPresentationSUP)
                .map((person) => person.indicateurPresentationSUP)[0] ?? null
        );
    }
}

export default Utilisateur;
