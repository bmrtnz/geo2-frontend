import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";
import Document from "./document.model";

@ModelName("EtiquetteUc")
export class EtiquetteUc extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field({ model: import("./document.model") }) public document: Document;

  get especeId() {
    return this.espece.id;
  }
}

export default EtiquetteUc;
