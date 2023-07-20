import { Field, Model, ModelName } from "./model";
import { Ordre } from "./ordre.model";
import { Client } from "./client.model";
import { Entrepot } from "./entrepot.model";
import { Secteur } from "./secteur.model";
import Transporteur from "./transporteur.model";
import BureauAchat from "./bureau-achat.model";
import Incoterm from "./incoterm.model";

export enum statusGEO {
  Traité = "TRAITE",
  NonTraité = "NON_TRAITE",
}

export enum status {
  Création = "CREATION",
  Modification = "UPDATE",
  Suppression = "DELETE",
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
  @Field() public referenceCommandeClient?: string;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Entrepot;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field({ model: import("./secteur.model") }) public secteur?: Secteur;
  @Field() public sourceFile?: string;
  @Field() public status?: status;
  @Field() public statusGEO?: statusGEO;
  @Field() public canalCde?: string;
  @Field({ dataType: "datetime" }) public dateDocument?: string;
  @Field({ dataType: "datetime" }) public dateLivraison?: string;
  @Field({ dataType: "localdate" }) public dateCreation?: string;
  @Field({ model: import("./transporteur.model") }) public proprietaire?: Transporteur;
  @Field({ model: import("./bureau-achat.model") }) public bureauAchat?: BureauAchat;
  @Field({ model: import("./incoterm.model") }) public incoterm?: Incoterm;
  @Field() public version?: number;
}

export default EdiOrdre;
