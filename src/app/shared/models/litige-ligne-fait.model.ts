import LitigeLigne from "./litige-ligne.model";
import { Field, Model, ModelName } from "./model";

@ModelName("LitigeLigneFait")
export class LitigeLigneFait extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./litige-ligne.model") }) public ligne: LitigeLigne;
  @Field() public totalNombreColis?: number;
  @Field() public totalPoidsNet?: number;
  @Field() public totalNombrePalette?: number;
}

export default LitigeLigneFait;
