import { Model, Field } from './model';
import { Espece } from './espece.model';
import { ModeCulture } from './mode-culture.model';
import { Type } from './type.model';
import { Variete } from './variete.model';
import { Origine } from './origine.model';
import { CalibreUnifie } from './calibre-unifie.model';
import { TypeVente } from './type-vente.model';

export class ArticleMatierePremiere extends Model {
  @Field({model: Espece}) public espece: Espece;
  @Field({model: Variete}) public variete: Variete;
  @Field({model: Type}) public type: Type;
  @Field({model: ModeCulture}) public modeCulture: ModeCulture;
  @Field({model: Origine}) public origine: Origine;
  @Field({model: CalibreUnifie}) public calibreUnifie: CalibreUnifie;
  @Field({model: TypeVente}) public typeVente: TypeVente;
  @Field({asKey: true, asLabel: true}) public id: string;
}
