import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";
import TracabiliteDetailPalette from "./tracabilite-detail-palette.model";

@ModelName("TracabiliteLigne")
export class TracabiliteLigne extends Model {
  @Field({ asKey: true }) public id?: number;
  @Field() public arboCode?: string;
  @Field() public nombreColis?: number;
  @Field({ model: import("./ordre-ligne.model") })
  public ordreLigne?: OrdreLigne;
  @Field({ model: import("./tracabilite-detail-palette.model") })
  public tracabiliteDetailPalette?: TracabiliteDetailPalette;
}

export default TracabiliteLigne;
