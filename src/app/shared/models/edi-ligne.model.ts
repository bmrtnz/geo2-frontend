import Ordre from "./ordre.model";
import EdiOrdre from "./edi-ordre.model";
import { Field, Model, ModelName } from "./model";

@ModelName("EdiLigne")
export class EdiLigne extends Model {
  @Field({ asKey: true, asLabel: true }) public id?: number;
  @Field() public codeInterneProduitBlueWhale?: string;
  @Field() public codeInterneProduitClient?: string;
  @Field() public eanColisBlueWhale?: string;
  @Field() public eanColisClient?: string;
  @Field() public eanProduitBlueWhale?: string;
  @Field() public eanProduitClient?: string;
  @Field({ model: import("./edi-ordre.model") }) public ediOrdre?: EdiOrdre;
  @Field() public libelleProduit?: string;
  @Field() public listeReferenceArticle?: string;
  @Field() public masqueModification?: string;
  @Field() public numeroLigne?: number;
  @Field() public operationMarketing?: boolean;
  @Field() public parCombien?: number;
  @Field() public prixVente?: number;
  @Field() public quantite?: number;
  @Field() public quantiteColis?: number;
  @Field() public status?: string;
  @Field() public alertePrix?: string;
  @Field() public typeColis?: string;
  @Field() public uniteQtt?: string;
}

export default EdiLigne;
