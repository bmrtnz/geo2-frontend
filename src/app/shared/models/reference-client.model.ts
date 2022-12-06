import Article from "./article.model";
import Client from "./client.model";
import { Field, Model, ModelName } from "./model";

@ModelName("ReferenceClient")
export class ReferenceClient extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./client.model") }) public client: Partial<Client>;
  @Field({ model: import("./article.model") }) public article: Partial<Article>;
  @Field({ asLabel: true }) public commentaire: string;
  @Field() public referenceProdet: string;
  @Field() public tauxRemiseSurFacture: number;
  @Field() public tauxSurFactureSupplementaire: boolean;
  @Field() public tauxSurFactureValide: boolean;
  @Field() public referenceProduit: string;
  @Field() public valide?: boolean;
}

export default ReferenceClient;
