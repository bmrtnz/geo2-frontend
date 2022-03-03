import { Field, Model, ModelName } from "./model";
import Secteur from "./secteur.model";

@ModelName("Pays")
export class Pays extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field() public numeroIso: string;
    @Field() public valide: boolean;
    @Field({ model: import("./secteur.model") }) public secteur: Secteur;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeAgrement: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCoursTemporaire: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCoursBlueWhale: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeAutorise: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeDepassement: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCoursActuel: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCoursNonEchu: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCours1a30: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCours31a60: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCours61a90: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeEnCours90Plus: number;
    @Field({
        allowSorting: false,
        allowHeaderFiltering: false,
        allowSearch: false,
        format: { type: "currency", precision: 2 },
        currency: "EUR",
    })
    public clientsSommeAlerteCoface: number;
}

export default Pays;
