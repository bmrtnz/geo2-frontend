import { Field, Model } from "./model";
import MRUEntrepot from "./mru-entrepot.model";
import Ordre from "./ordre.model";
import Societe from "./societe.model";
import Utilisateur from "./utilisateur.model";

export class MRUOrdre extends Model {
  @Field({asKey: true, model: import('./ordre.model')}) public ordre: Ordre;
  @Field({model: import('./utilisateur.model')}) public utilisateur: Utilisateur;
  @Field({model: import('./mru-entrepot.model')}) public entrepot: MRUEntrepot;
  @Field({model: import('./societe.model')}) public societe: Societe;
  @Field({asLabel: true}) public numero: string;
}

export default MRUOrdre;