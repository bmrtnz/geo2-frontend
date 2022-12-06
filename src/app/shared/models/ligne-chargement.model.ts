import Article from "./article.model";
import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";
import Ordre from "./ordre.model";

@ModelName("LigneChargement")
export class LigneChargement extends Model {
  @Field({ asKey: true }) id: number;
  @Field({ asLabel: true }) codeChargement: string;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field() numeroOrdre: string;
  @Field() codeFournisseur: string;
  @Field() codeEntrepot: string;
  @Field({ dataType: "localdate" }) dateDepartPrevue: string;
  @Field({ dataType: "localdate" }) dateLivraisonPrevue: string;
  @Field({ model: import("./article.model") }) public article?: Article;
  @Field() descriptionArticle: string;
  @Field() descriptionColis: string;
  @Field() nombrePalettesCommandees: number;
  @Field() nombreColisCommandes: number;
  @Field() nombreColisPalette: number;
  @Field({ model: import("./ordre-ligne.model") }) public ligne?: OrdreLigne;
  @Field() numeroCamion: number;
  @Field() ordreChargement: number;
  @Field({ dataType: "localdate" }) dateDepartPrevueFournisseur: string;
}

export default LigneChargement;
