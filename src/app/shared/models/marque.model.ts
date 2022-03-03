import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";

@ModelName("Marque")
export class Marque extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field({ model: import("./espece.model") }) public espece: Espece;
    get especeId() {
        return this.espece.id;
    }
}

export default Marque;
