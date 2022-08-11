import { Field, Model, ModelName } from "./model";

@ModelName("CommandeEdi")
export class CommandeEdi extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field() public clientId?: string;
  @Field() public clientRaisonSocial?: string;
  @Field() public eanProduitClient?: string;
  @Field() public entrepotId?: string;
  @Field() public entrepotRaisonSocial?: string;
  @Field() public fichierSource?: string;
  @Field() public libelleProduit?: string;
  @Field() public listArticleId?: string;
  @Field() public masqueLigne?: string;
  @Field() public masqueOrdre?: string;
  @Field() public numeroLigne?: number;
  @Field() public ordreId?: string;
  @Field() public parCombien?: string;
  @Field() public quantite?: number;
  @Field() public quantiteColis?: number;
  @Field() public refCmdClient?: string;
  @Field() public status?: string;
  @Field() public statusGeo?: string;
  @Field() public typeColis?: string;
  @Field() public uniteQtt?: string;
  @Field() public version?: string;
  @Field({ dataType: "datetime" }) public dateDocument?: string;
  @Field({ dataType: "datetime" }) public dateLivraison?: string;

}

export default CommandeEdi;
