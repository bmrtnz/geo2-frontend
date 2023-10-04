import BaseTarif from "./base-tarif.model";
import { Field, Model, ModelName } from "./model";

@ModelName("AttribFrais")
export class AttribFrais extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field() public fraisPU?: number;
  @Field({ model: import("./base-tarif.model") }) public fraisUnite?: BaseTarif;
  @Field() public accompte?: number;
  @Field() public perequation?: boolean;
  @Field() public dateModification: Date;
  @Field() public userModification: string;
  @Field() public valide: boolean;
}

export default AttribFrais;
