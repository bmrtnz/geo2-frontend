import Transporteur from "./transporteur.model";
import Historique from "./historique.model";
import { Field, ModelName } from "./model";

@ModelName("HistoriqueTransporteur")
export class HistoriqueTransporteur extends Historique {
  @Field({ model: import("./transporteur.model") }) public transporteur: Transporteur;
}

export default HistoriqueTransporteur;
