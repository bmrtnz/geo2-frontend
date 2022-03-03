import { Field, Model, ModelName } from "./model";

@ModelName("Secteur")
export class Secteur extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field() public valide: boolean;
}

export default Secteur;
