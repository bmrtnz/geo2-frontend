import { BaseStock } from "./base-stock.model";
import Fournisseur from "./fournisseur.model";
import { Field, ModelName } from "./model";
import StockMouvement from "./stock-mouvement.model";
import TypePalette from "./type-palette.model";

@ModelName("Stock")
export class Stock extends BaseStock {
  @Field({ asLabel: true }) description: string;
  @Field({ model: import("./fournisseur.model") }) proprietaire: Fournisseur;
  @Field({ model: import("./stock-mouvement.model") }) mouvements: StockMouvement[];
  @Field({ model: import("./type-palette.model") }) typePalette: TypePalette;
  @Field() quantite: number;
  @Field() type: string;
  @Field() nomUtilisateur: string;
  @Field() utilisateurInfo: string;
  @Field() dateInfo: string;
  @Field() quantiteInitiale: number;
  @Field() quantiteReservee: number;
}

export default Stock;
