import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";

@ModelName("OrdreLigneLitigePick")
export class OrdreLigneLitigePick extends Model {

  @Field() public rownum: number;
  @Field() public totalNombreColis: number;
  @Field({ model: import("./ordre-ligne.model") }) public ordreLigne: OrdreLigne;
}

export default OrdreLigneLitigePick;
