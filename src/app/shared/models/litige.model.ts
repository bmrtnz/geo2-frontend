import LitigeLigne from "./litige-ligne.model";
import { Field, Model, ModelName } from "./model";
import Ordre from "./ordre.model";

@ModelName("Litige")
export class Litige extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ model: import("./ordre.model") })
  public ordreOrigine?: Partial<Ordre>;
  @Field({ model: import("./ordre.model") }) public ordreAvoirClient?: Ordre;
  @Field({ model: import("./litige-ligne.model") })
  public lignes?: LitigeLigne[];
  @Field() public fraisAnnexes?: number;
  @Field() public causeLitigeCode?: string;
  @Field() public clientCloture?: boolean;
  @Field() public clientValideAdmin?: boolean;
  @Field() public commentairesInternes?: string;
  @Field() public commentairesResponsable?: string;
  @Field() public consequenceLitigeCode?: string;
  @Field({ dataType: "localdate" }) public dateAvoirClient?: string;
  @Field({ dataType: "localdate" }) public dateAvoirFournisseur?: string;
  @Field({ dataType: "localdate" }) public dateCreation?: string;
  @Field({ dataType: "localdate" }) public dateEnvoiDocuments?: string;
  @Field({ dataType: "localdate" }) public dateModification?: string;
  @Field({ dataType: "localdate" }) public dateOrigine?: string;
  @Field({ dataType: "localdate" }) public dateResolution?: string;
  @Field() public enCoursNegociation?: boolean;
  @Field() public fournisseurCloture?: boolean;
  @Field() public fournisseurValideAdmin?: boolean;
  @Field() public fraisAnnexesCommentaires: number;
  @Field() public numeroVersion: number;
  @Field({ model: import("./ordre.model") })
  public ordreAvoirFournisseur?: Ordre;
  @Field({ model: import("./ordre.model") }) public ordreReplacement?: Ordre;
  @Field() public referenceClient?: string;
  @Field() public responsableTiers?: string;
  @Field() public responsableTiersCode?: string;
  @Field() public totalMontantRistourne?: number;
  @Field() public userModification?: string;
  @Field() public valide?: boolean;
}

export default Litige;
