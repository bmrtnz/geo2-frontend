import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";
import Document from "./document.model";

@ModelName("Stickeur")
export class Stickeur extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field({ model: import("./document.model") }) public document: Document;

  get especeId() {
    return this.espece.id;
  }
}

export default Stickeur;
