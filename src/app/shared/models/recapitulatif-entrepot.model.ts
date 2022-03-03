import SupervisionPalox from "./supervision-palox.model";
import { Field } from "./model";

export class RecapitulatifEntrepot extends SupervisionPalox {
    @Field() station: string;
}

export default RecapitulatifEntrepot;
