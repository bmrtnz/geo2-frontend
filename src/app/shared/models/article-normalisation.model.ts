import { Field, Model, ModelName } from "./model";
import { Stickeur } from "./stickeur.model";
import { Marque } from "./marque.model";
import { EtiquetteColis } from "./etiquette-colis.model";
import { EtiquetteUc } from "./etiquette-UC.model";
import { EtiquetteEvenementielle } from "./etiquette-evt.model";
import { CalibreMarquage } from "./calibre-marquage.model";
import { IdentificationSymbolique } from "./identification-symbolique.model";
import { Espece } from "./espece.model";

@ModelName("ArticleNormalisation")
export class ArticleNormalisation extends Model {
    @Field({ asKey: true, asLabel: true }) public id: string;
    @Field({ model: import("./espece.model") }) public espece: Espece;
    @Field({ model: import("./stickeur.model") }) public stickeur: Stickeur;
    @Field({ model: import("./marque.model") }) public marque: Marque;
    @Field({ model: import("./etiquette-colis.model") })
    public etiquetteColis: EtiquetteColis;
    @Field({ model: import("./etiquette-UC.model") })
    public etiquetteUc: EtiquetteUc;
    @Field({ model: import("./etiquette-evt.model") })
    public etiquetteEvenementielle: EtiquetteEvenementielle;
    @Field({ model: import("./calibre-marquage.model") })
    public calibreMarquage: CalibreMarquage;
    @Field({ model: import("./identification-symbolique.model") })
    public identificationSymbolique: IdentificationSymbolique;
    @Field() public gtinUc: string;
    @Field() public gtinColis: string;
    @Field() public articleClient: string;
    @Field() public produitMdd: boolean;
}

export default ArticleNormalisation;
