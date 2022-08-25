import { Field, Model, ModelName } from "./model";
import { Ordre } from "./ordre.model";
import { Client } from "./client.model";
import { Entrepot } from "./entrepot.model";
import { Secteur } from "./secteur.model";

export enum statusGEO {
  Traité = "TRAITE",
  NonTraité = "NON_TRAITE"
}

export enum status {
  Création = "CREATION",
  Modification = "UPDATE",
  Suppression = "DELETE"
}

@ModelName("EdiOrdre")
export class EdiOrdre extends Model {

  @Field({ asKey: true }) public id?: number;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field() public lfCommandePar?: string;
  @Field() public lfFactureA?: string;
  @Field() public lfFournisseur?: string;
  @Field() public lfLivreA?: string;
  @Field() public masqueModification?: string;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Entrepot;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field({ model: import("./secteur.model") }) public secteur?: Secteur;
  @Field() public sourceFile?: string;
  @Field() public status?: status;
  @Field() public statusGEO?: statusGEO;
  @Field({ dataType: "datetime" }) public dateDocument?: string;
  @Field({ dataType: "datetime" }) public dateLivraison?: string;
  @Field({ dataType: "localdate" }) public dateCreation?: string;
  @Field() public version?: number;
}

export default EdiOrdre;
