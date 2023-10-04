import { Societe } from ".";
import { Field, Model, ModelName } from "./model";

@ModelName("DeclarationFraude")
export class DeclarationFraude extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field({ model: import("./societe.model") }) societe: Societe;
  @Field() numeroOrdre: string;
  @Field({ dataType: "datetime" }) dateDepartPrevue: string;
  @Field() clientCode: string;
  @Field() entrepotCode: string;
  @Field() referenceClient: string;
  @Field() paysCode: string;
  @Field() paysDescription: string;
  @Field() fournisseurCode: string;
  @Field({ dataType: "datetime" }) dateDepartPrevueFournisseur: string;
  @Field() nombrePalettesCommandees: number;
  @Field() nombreColisCommandes: number;
  @Field() varieteCode: string;
  @Field() colisCode: string;
  @Field() dateDepartPrevueFournisseurBrute: string;
  @Field({ dataType: "datetime" }) dateModification: string;
  @Field() codeChargement: string;
  @Field({ dataType: "datetime" }) etdDate: string;
  @Field() etdLocation: string;
  @Field({ dataType: "datetime" }) etaDate: string;
  @Field() etaLocation: string;
  @Field() colisPrepese: boolean;
  @Field() incotermCode: string;
  @Field() poidsNetClient: number;
  @Field() transporteurCode: string;
  @Field() commentaireInterne: string;
  @Field() origineDescription: string;
  @Field() gtinColis: string;
}
export default DeclarationFraude;
