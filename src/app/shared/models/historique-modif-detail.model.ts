import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";
import OrdreLogistique from "./ordre-logistique.model";
import Ordre from "./ordre.model";

@ModelName("HistoriqueModificationDetail")
export class HistoriqueModificationDetail extends Model {
    @Field({ asKey: true }) public id?: string;
    @Field({ dataType: "localdate" }) public dateModification?: string;
    @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
    @Field({ model: import("./ordre.model") }) public ligne?: OrdreLigne;
    @Field({ model: import("./ordre.model") }) public logistique?: OrdreLogistique;
    @Field() public nombreColisExpediesApres: number;
    @Field() public nombreColisExpediesAvant: number;
    @Field() public nombrePalettesExpedieesApres: number;
    @Field() public nombrePalettesExpedieesAvant: number;
    @Field() public poidsBrutExpedieApres: number;
    @Field() public poidsBrutExpedieAvant: number;
    @Field() public poidsNetExpedieApres: number;
    @Field() public poidsNetExpedieAvant: number;
    @Field() public userModification?: string;
}

export default HistoriqueModificationDetail;

