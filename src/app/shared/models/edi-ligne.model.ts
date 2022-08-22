import { Field, Model, ModelName } from "./model";
import { Ordre } from "./ordre.model";

@ModelName("EDILigne")
export class EDILigne extends Model {

  @Field({ asKey: true, asLabel: true }) public id?: string;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field() public codeInterneProduitBlueWhale?: string;
  @Field() public codeInterneProduitClient?: string;
  @Field() public eanColisBlueWhale?: string;
  @Field() public eanColisClient?: string;
  @Field() public eanProduitBlueWhale?: string;
  @Field() public eanProduitClient?: string;
  @Field() public ediOrdreGeoEDI?: string;
  @Field() public libelleProduit?: string;
  @Field() public numeroLigne?: number;
  @Field() public operationMarketing?: boolean;
  @Field() public parCombien?: number;
  @Field() public prixVente?: number;
  @Field() public quantite?: number;
  @Field() public quantiteColis?: number;
  @Field() public typeColis?: string;
  @Field() public uniteQtt?: string;

}

export default EDILigne;

