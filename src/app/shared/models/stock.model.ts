import Article from "./article.model";
import { BaseStock } from "./base-stock.model";
import Fournisseur from "./fournisseur.model";
import { Field, ModelName } from "./model";
import StockMouvement from "./stock-mouvement.model";
import TypePalette from "./type-palette.model";

@ModelName("Stock")
export class Stock extends BaseStock {
  @Field() id: string;
  @Field({ asLabel: true }) description: string;
  @Field({ model: import("./fournisseur.model") }) proprietaire: Fournisseur;
  @Field({ model: import("./article.model") }) article: Article;
  @Field({ model: import("./stock-mouvement.model") }) mouvements: StockMouvement[];
  @Field({ model: import("./type-palette.model") }) typePalette: TypePalette;
  @Field() quantite: number;
  @Field() type: string;
  @Field() nomUtilisateur: string;
  @Field() utilisateurInfo: string;
  @Field({ dataType: "datetime" }) public dateInfo?: string;
  @Field() quantiteInitiale: number;
  @Field() quantiteReservee: number;
  @Field() quantiteDisponible: number;
  @Field() totalMouvements: number;
  @Field() quantiteTotale: number;
  @Field() statutStock: string;
  @Field() age: string;
  @Field({ dataType: "datetime" }) public dateFabrication?: string;
  @Field({ dataType: "datetime" }) public dateStatut?: string;
  @Field({ model: import("./stock.model") }) stockOrigine: Stock;
}

export default Stock;
