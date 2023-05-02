import BaseTarif from "./base-tarif.model";
import BureauAchat from "./bureau-achat.model";
import Devise from "./devise.model";
import Entrepot from "./entrepot.model";
import { Field, Model, ModelName } from "./model";
import Transporteur from "./transporteur.model";

@ModelName("EntrepotTransporteurBassin")
export class EntrepotTransporteurBassin extends Model {
  @Field({ asKey: true }) public id: number;
  @Field({ model: import("./entrepot.model") }) public entrepot: Entrepot;
  @Field({ model: import("./transporteur.model") })
  public transporteur: Transporteur;
  @Field({ model: import("./bureau-achat.model") })
  public bureauAchat: BureauAchat;
  @Field({ model: import("./base-tarif.model") })
  public baseTarifTransport: BaseTarif;
  @Field({ model: import("./devise.model") })
  public deviseTarifTransport: Devise;
  @Field() public prixUnitaireTarifTransport: number;
}

export default EntrepotTransporteurBassin;
