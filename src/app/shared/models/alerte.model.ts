import { Secteur } from "./secteur.model";
import { Field, Model, ModelName } from "./model";

@ModelName("Alerte")
export class Alerte extends Model {
  @Field({ asKey: true, asLabel: true }) public id: number;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field({ dataType: "datetime" }) public dateCreation?: string;
  @Field({ dataType: "datetime" }) public dateDebut?: string;
  @Field({ dataType: "datetime" }) public dateFin?: string;
  @Field() public message?: string;
  @Field() public type?: string;
  @Field() public userCreation?: string;
  @Field() public userCruserModificationeation?: string;
  @Field({ model: import("./secteur.model") }) public secteur?: Partial<Secteur>;
  @Field() public deroulant?: boolean;
  @Field() public valide?: boolean;

}

export default Alerte;

