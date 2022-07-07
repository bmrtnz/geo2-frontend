import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";

@ModelName("PreEmballage")
export class Emballage extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public description: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  get especeId() {
    return this.espece.id;
  }
  @Field() public codeEmbadif: string;
  @Field() public coutMatierePremiere: number;
  @Field({ dataType: "datetime" }) public dateModification: string;
  @Field() public descriptionClient: string;
  @Field() public dimension: string;
  @Field() public quantiteUc: number;
  @Field() public tare: number;
  @Field() public uniteUc: string;
  @Field() public userModification?: string;
  @Field() public valide?: boolean;
}
export default Emballage;

