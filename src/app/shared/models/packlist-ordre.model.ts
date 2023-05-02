import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";
import PacklistEntete from "./packlist-entete.model";

@ModelName("PacklistOrdre")
export class PacklistOrdre extends Model {
  @Field({ asKey: true }) id: number;
  @Field({ model: import("./packlist-entete.model") }) entete: PacklistEntete;
  @Field({ model: import("./ordre.model") }) ordre: Partial<Ordre>;
}

export default PacklistOrdre;
