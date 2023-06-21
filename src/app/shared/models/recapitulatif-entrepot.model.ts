import SupervisionPalox from "./supervision-palox.model";
import { Field, ModelName } from "./model";

@ModelName("RecapitulatifEntrepot")
export class RecapitulatifEntrepot extends SupervisionPalox {
  @Field() station: string;
  @Field() solde: string;
}

export default RecapitulatifEntrepot;
