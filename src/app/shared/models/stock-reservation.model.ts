import { Field, Model, ModelName } from "./model";
import StockQuantite from "./stock-quantite.model";

@ModelName("StockReservation")
export class StockReservation extends StockQuantite {

  @Field({ asKey: true })
  id: number;

  @Field()
  fournisseurCode: string;

  @Field()
  proprietaireCode: string;

  @Field()
  typePaletteCode: string;

  @Field()
  option: string;

  @Field()
  quantiteInitiale: number;

  @Field()
  quantiteReservee: number;

  @Field()
  quantiteDisponible: number;

  @Field({ dataType: "date" })
  dateFabrication: string;
}

export default StockReservation;
