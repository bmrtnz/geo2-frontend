import { Model, Field } from './model';
import { Coloration } from './coloration.model';
import { Categorie } from './categorie.model';
import { Sucre } from './sucre.model';
import { Penetro } from './penetro.model';
import { Cirage } from './cirage.model';
import { Rangement } from './rangement.model';
import { Espece } from './espece.model';

export class ArticleCahierDesCharges extends Model {
  @Field({asKey: true, asLabel: true}) public id: string;
  @Field() public instructionStation: string;
  @Field({model: Espece}) public espece: Espece;
  @Field({model: Coloration}) public coloration: Coloration;
  @Field({model: Categorie}) public categorie: Categorie;
  @Field({model: Sucre}) public sucre: Sucre;
  @Field({model: Penetro}) public penetro: Penetro;
  @Field({model: Cirage}) public cirage: Cirage;
  @Field({model: Rangement}) public rangement: Rangement;
}
