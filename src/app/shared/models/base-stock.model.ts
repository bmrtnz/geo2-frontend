import { Field, Model, ModelName } from "./model";
import { Fournisseur } from "./fournisseur.model";
import { Espece } from "./espece.model";

export abstract class BaseStock extends Model {
    @Field({ asKey: true, asLabel: true }) public id: string;
    @Field({ model: import("./fournisseur.model") })
    public fournisseur: Fournisseur;
    @Field({ model: import("./espece.model") }) public espece: Espece;
    @Field() public valide: boolean;
}
