import { Field, Model, ModelName } from "./model";
import { Coloration } from "./coloration.model";
import { Categorie } from "./categorie.model";
import { Sucre } from "./sucre.model";
import { Penetro } from "./penetro.model";
import { Cirage } from "./cirage.model";
import { Rangement } from "./rangement.model";
import { Espece } from "./espece.model";

@ModelName("ArticleCahierDesCharges")
export class ArticleCahierDesCharges extends Model {
  @Field({ asKey: true, asLabel: true }) public id: string;
  @Field() public instructionStation: string;
  @Field({ model: import("./espece.model") }) public espece: Espece;
  @Field({ model: import("./coloration.model") })
  public coloration: Coloration;
  @Field({ model: import("./categorie.model") }) public categorie: Categorie;
  @Field({ model: import("./sucre.model") }) public sucre: Sucre;
  @Field({ model: import("./penetro.model") }) public penetro: Penetro;
  @Field({ model: import("./cirage.model") }) public cirage: Cirage;
  @Field({ model: import("./rangement.model") }) public rangement: Rangement;
}

export default ArticleCahierDesCharges;
