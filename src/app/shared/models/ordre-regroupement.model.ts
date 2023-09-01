import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";

@ModelName("OrdreRegroupement")
export class OrdreRegroupement extends Model {
  @Field({ asKey: true }) ordreOrigine: string;
  @Field({ asKey: true }) numero: string;
  @Field() codeChargement: string;
  @Field() ordreRegroupement: string;
  @Field() raisonSocial: string;
  @Field() ville: string;
  @Field() refArticleOrigine: string;
  @Field() descriptionVariete: string;
  @Field() groupe: string;
  @Field() description: string;
  @Field() nombrePalettesCommandees: string;
  @Field() nombreColis: number;
  @Field() poidsNetCommande: number;
  @Field({ dataType: "localdate" }) dateDepartPrevue: string;
  @Field({ dataType: "localdate" }) dateLivraisonPrevue: string;
  @Field() transporteurCode: string;
  @Field() station: string;
}

export default OrdreRegroupement;
