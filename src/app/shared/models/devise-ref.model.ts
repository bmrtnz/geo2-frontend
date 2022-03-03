import { Field, Model, ModelName } from "./model";
import Devise from "./devise.model";

@ModelName("DeviseRef")
export class DeviseRef extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public description: string;
    @Field() public taux: number;
    @Field() public tauxAchat: number;
    @Field() public valide: boolean;
    @Field({ model: import("./devise.model") }) public devise: Devise;
    get deviseId() {
        return this.devise.id;
    }
}

export default DeviseRef;
