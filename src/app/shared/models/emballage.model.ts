import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";
import GroupeEmballage from "./groupe-emballage.model";
import Marque from "./marque.model";

@ModelName("Emballage")
export class Emballage extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  get especeId() {
    return this.espece.id;
  }
  @Field() public codeEan: string;
  @Field() public codeEanUc: string;
  @Field() public codeEmbadif: string;
  @Field() public codeGestionnaire: string;
  @Field() public commentaire: string;
  @Field() public consigne: boolean;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public descriptionTechnique: string;
  @Field() public dimension: string;
  @Field({ model: import("./groupe-emballage.model") }) public groupe: GroupeEmballage;
  @Field() public especeEmballee: string;
  @Field() public idSymbolique: string;
  @Field({ model: import("./marque.model") }) public marque: Marque;
  @Field() public normalisation: string;
  @Field() public reference: string;
  @Field() public referenceGestionnaire: string;
  @Field() public userModification?: string;
  @Field() public nbConso?: number;
  @Field() public suiviPalox: boolean;
  @Field() public valide: boolean;
  @Field() public hauteur: number;
  @Field() public hauteurMaximumPalette: number;
  @Field() public largeur: number;
  @Field() public longueur: number;
  @Field() public poidsNetColis: number;
  @Field() public prixUnitaireAchat: number;
  @Field() public prixUnitaireMainOeuvre: number;
  @Field() public prixUnitaireMatierePremiere: number;
  @Field() public prixUnitaireVente: number;
  @Field() public tare: number;
  @Field() public xb: number;
  @Field() public xh: number;
  @Field() public yb: number;
  @Field() public yh: number;
  @Field() public zb: number;
  @Field() public zh: number;
}
export default Emballage;
