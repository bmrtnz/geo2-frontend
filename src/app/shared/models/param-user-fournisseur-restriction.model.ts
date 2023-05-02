import { Field, Model, ModelName } from "./model";
import { Fournisseur } from "./fournisseur.model";
import { Utilisateur } from "./utilisateur.model";

@ModelName("ParamUserFournisseurRestriction")
export class ParamUserFournisseurRestriction extends Model {
  @Field({ asKey: true }) public id: number;
  @Field({ model: import("./fournisseur.model") })
  public fournisseur: Fournisseur;
  @Field({ model: import("./utilisateur.model") })
  public utilisateur: Utilisateur;
}

export default ParamUserFournisseurRestriction;
