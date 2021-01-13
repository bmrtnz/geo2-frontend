import { Field, Model } from "./model";
import Ordre from "./ordre.model";
import Societe from "./societe.model";
import Utilisateur from "./utilisateur.model";

export class MRUOrdre extends Model {
  @Field({asLabel: true}) public numero: string;
  @Field({asKey: true, model: import('./ordre.model')}) public ordre: Ordre;
  @Field({asKey: true, model: import('./utilisateur.model')}) public utilisateur: Utilisateur;
  @Field({model: import('./societe.model')}) public societe: Societe;
}

export default MRUOrdre;
