import { EdiLigne } from "./edi-ligne.model";
import { Article } from "./article.model";
import { BaseTarif } from "./base-tarif.model";
import { BureauAchat } from "./bureau-achat.model";
import Fournisseur from "./fournisseur.model";
import EdiOrdre from "./edi-ordre.model";
import Client from "./client.model";
import Campagne from "./campagne.model";
import { Field, Model, ModelName } from "./model";

@ModelName("StockArticleEdiBassin")
export class StockArticleEdiBassin extends Model {

  @Field({ asKey: true, asLabel: true }) public id?: number;
  @Field() public achatDevisePrixUnitaire: number;
  @Field() public achatDeviseTaux: number;
  @Field() public achatPrixUnitaire: number;
  @Field() public age: string;
  @Field() public gtin: string;
  @Field() public numeroLigneEDI: number;
  @Field() public numeroOrdreEDI: number;
  @Field() public quantiteReservee: number;
  @Field() public ventePrixUnitaire: number;
  @Field() public ventePrixUnitaireNet: number;
  @Field({ model: import("./base-tarif.model") }) public venteUnite: BaseTarif;
  @Field({ model: import("./base-tarif.model") }) public achatUnite: BaseTarif;
  @Field({ model: import("./edi-ordre.model") }) public ordreEdi: EdiOrdre;
  @Field({ model: import("./edi-ligne.model") }) public ligneEdi: EdiLigne;
  @Field({ model: import("./fournisseur.model") }) public fournisseur?: Fournisseur;
  @Field({ model: import("./fournisseur.model") }) public proprietaire?: Fournisseur;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field({ model: import("./campagne.model") }) public campagne?: Campagne;
  @Field({ model: import("./bureau-achat.model") }) public bureauAchat?: BureauAchat;
  @Field({ model: import("./article.model") }) public article?: Article;

}

export default StockArticleEdiBassin;
