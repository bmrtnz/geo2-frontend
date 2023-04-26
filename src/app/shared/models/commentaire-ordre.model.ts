import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";

@ModelName("CommentaireOrdre")
export class CommentaireOrdre extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public commentaires: string;
  @Field({ model: import("./ordre.model") }) public ordre: Ordre;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field() public userModification?: string;
  get ordreId() {
    return this.ordre.id;
  }
}

export default CommentaireOrdre;
