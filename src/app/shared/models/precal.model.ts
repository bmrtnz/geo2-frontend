import { Field, Model, ModelName } from "./model";
import Variete from "./variete.model";
import Fournisseur from "./fournisseur.model";
import ModeCulture from "./mode-culture.model";

@ModelName("Precal")
export class Precal extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./fournisseur.model") })
  public fournisseur: Fournisseur;
  @Field({ model: import("./variete.model") }) public variete: Variete;
  @Field({ model: import("./mode-culture.model") })
  public modeCulture: ModeCulture;
  @Field() public choix: string;
  @Field() public colo: string;
  @Field() public commentaire: string;
  @Field() public semaine: string;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public quantite: number;
  @Field() public userModification: string;
  @Field() public valide: boolean;

  @Field() public p56: number;
  @Field() public p64: number;
  @Field() public p72: number;
  @Field() public p80: number;
  @Field() public p88: number;
  @Field() public p100: number;
  @Field() public p113: number;
  @Field() public p125: number;
  @Field() public p138: number;
  @Field() public p150: number;
  @Field() public p163: number;
  @Field() public p175: number;
  @Field() public p198: number;
  @Field() public p204: number;
  @Field() public p216: number;
  @Field() public p232: number;
  @Field() public p248: number;
  @Field() public p267: number;
  @Field() public p288: number;
  @Field() public p327: number;
}

export default Precal;
