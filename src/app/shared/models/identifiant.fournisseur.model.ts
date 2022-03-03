import { Field, Model, ModelName } from "./model";

@ModelName("IdentifiantFournisseur")
export class IdentifiantFournisseur extends Model {
    @Field({ asKey: true }) public id: number;
    @Field({ asLabel: true }) public libelle: string;
    @Field() public valide: boolean;
}

export default IdentifiantFournisseur;
