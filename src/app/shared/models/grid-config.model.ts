import { Field, Model, ModelName } from "./model";
import { Utilisateur } from "./utilisateur.model";

@ModelName("GridConfig")
export class GridConfig extends Model {
    @Field({ asKey: true, model: import("./utilisateur.model") })
    public utilisateur: Utilisateur;
    @Field({ asKey: true, asLabel: true }) public grid: string;
    @Field() public config: any;
}

export default GridConfig;
