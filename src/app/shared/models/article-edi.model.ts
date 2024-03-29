import { Article } from "./article.model";
import Client from "./client.model";
import { Field, Model, ModelName } from "./model";

@ModelName("EdiArticleClient")
export class EdiArticleClient extends Model {
  @Field({ asKey: true, asLabel: true }) public id: number;
  @Field({ model: import("./article.model") }) public article?: Partial<Article>;
  @Field({ model: import("./client.model") }) public client?: Partial<Client>;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field() public dernierOrdre?: string;
  @Field() public description?: string;
  @Field() public gtinColisClient?: string;
  @Field() public userModification?: string;
  @Field() public codeArticleClient?: string;
  @Field() public priorite?: number;
  @Field() public valide?: boolean;

}

export default EdiArticleClient;
