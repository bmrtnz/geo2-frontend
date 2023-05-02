import CodifDevalexp from "./codif-devalexp.model";
import { Field, Model, ModelName } from "./model";
import OrdreLogistique from "./ordre-logistique.model";

@ModelName("HistoriqueLogistique")
export class HistoriqueLogistique extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ dataType: "localdate" }) public dateModification?: string;
  @Field({ model: import("./codif-devalexp.model") })
  public devalexp?: CodifDevalexp;
  @Field({ model: import("./ordre-logistique.model") })
  public logistique?: OrdreLogistique;
  @Field() public expedieStation: boolean;
  @Field() public userModification?: string;
}

export default HistoriqueLogistique;
