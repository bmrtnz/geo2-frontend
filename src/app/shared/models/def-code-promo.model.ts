import { Field, Model, ModelName } from "./model";
import { Espece } from "./espece.model";
import { Variete } from "./variete.model";
import CodePromo from "./code-promo.model";

@ModelName("DefCodePromo")
export class DefCodePromo extends Model {
  @Field({ asKey: true, model: import("./code-promo.model") })
  public codePromo: CodePromo;
  @Field() public numeroTri: number;
  @Field({ asKey: true, model: import("./espece.model") })
  public espece: Espece;
  @Field({ asKey: true, model: import("./variete.model") })
  public variete: Variete;
  @Field() public valide: boolean;
  get especeId() {
    return this.espece.id;
  }
  get varieteId() {
    return this.variete.id;
  }
  get codePromoId() {
    return this.codePromo.id;
  }
}

export default DefCodePromo;
