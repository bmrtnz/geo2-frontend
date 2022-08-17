import { Client, Entrepot } from ".";
import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";

@ModelName("CommandeEdi")
export class CommandeEdi extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field() public eanProduitClient?: string;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Entrepot;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field() public fichierSource?: string;
  @Field() public libelleProduit?: string;
  @Field() public listArticleId?: string;
  @Field() public masqueLigne?: string;
  @Field() public masqueOrdre?: string;
  @Field() public numeroLigne?: number;
  @Field() public parCombien?: string;
  @Field() public quantite?: number;
  @Field() public prixVente?: number;
  @Field() public quantiteColis?: number;
  @Field() public refCmdClient?: string;
  @Field() public status?: string;
  @Field() public statusGeo?: string;
  @Field() public typeColis?: string;
  @Field() public uniteQtt?: string;
  @Field() public version?: string;
  @Field() public refEdiOrdre: string;
  @Field({ dataType: "datetime" }) public dateDocument?: string;
  @Field({ dataType: "datetime" }) public dateLivraison?: string;

}

export default CommandeEdi;
