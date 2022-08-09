import EntrepotTransporteurBassin from "./entrepot-transporteur-bassin.model";
import { Field, Model, ModelName } from "./model";

@ModelName("BureauAchat")
export class BureauAchat extends Model {
  @Field({ asKey: true }) id: string;
  @Field({ asLabel: true }) raisonSocial: string;
  @Field() emailInterlocuteurBW: string;
  @Field() valide: boolean;
  @Field({ model: import("./entrepot-transporteur-bassin.model") }) bassins: EntrepotTransporteurBassin[];
}

export default BureauAchat;
