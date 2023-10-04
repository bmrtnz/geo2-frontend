import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";

@ModelName("Categorie")
export class Categorie extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field() public cahierDesChargesBlueWhale: string;
  get especeId() {
    return this.espece.id;
  }
}

export default Categorie;
