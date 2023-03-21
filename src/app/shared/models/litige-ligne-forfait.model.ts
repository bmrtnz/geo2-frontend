import Article from "./article.model";
import { Field, Model, ModelName } from "./model";

@ModelName("LitigeLigneForfait")
export class LitigeLigneForfait extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./article.model") }) public article: Article;
  @Field() public numeroGroupementLitige: string;
  @Field() public clientPrixUnitaire: number;
  @Field() public clientQuantite: number;
  @Field() public clientUniteFactureCode: string;
  @Field() public clientUniteDeviseCode: string;
  @Field() public devisePrixUnitaire: number;
  @Field() public responsablePrixUnitaire: number;
  @Field() public responsableUniteFactureCode: string;
  @Field() public responsableQuantite: number;
  @Field() public deviseTaux: number;
  @Field() public deviseCode: string;
  @Field() public forfaitClient: number;
  @Field() public forfaitResponsable: number;
}

export default LitigeLigneForfait;
