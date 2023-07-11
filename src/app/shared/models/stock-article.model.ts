import { Field, Model, ModelName } from "./model";
import StockQuantite from "./stock-quantite.model";
import Stock from "./stock.model";

@ModelName("StockArticle")
export class StockArticle extends StockQuantite {
  @Field({ asKey: true })
  id: number;

  @Field({ asLabel: true })
  articleDescription: string;

  @Field()
  articleID: string;

  @Field({ model: import("./stock.model") }) stock: Stock;

  @Field()
  descriptionAbregee: string;

  @Field()
  bio: boolean;

  @Field()
  age: string;

  @Field()
  valide: boolean;

  @Field()
  especeID: string;

  @Field()
  varieteID: string;

  @Field()
  calibreFournisseurID: string;

  @Field()
  calibreMarquageID: string;

  @Field()
  categorieID: string;

  @Field()
  colisID: string;

  @Field()
  origineID: string;

  @Field()
  stockID: string;

  @Field()
  fournisseurCode: string;

  @Field()
  proprietaireCode: string;

  @Field()
  description: string;
  @Field({ dataType: "datetime" })
  dateFabrication: string;

  @Field()
  statut: string;

  @Field({ dataType: "datetime" })
  dateStatut: string;

  @Field()
  typePaletteID: string;

  @Field()
  commentaire: string;

  @Field()
  quantiteHebdomadaire: number;

  @Field()
  prevision3j: number;

  @Field()
  prevision7j: number;
}

export default StockArticle;
