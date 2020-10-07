import { Model, Field } from './model';
import { Espece } from './espece.model';
import { ModeCulture } from './mode-culture.model';
import { Type } from './type.model';
import { Variete } from './variete.model';
import { Origine } from './origine.model';
import { CalibreUnifie } from './calibre-unifie.model';
import { TypeVente } from './type-vente.model';

export class ArticleMatierePremiere extends Model {
  @Field({model: import('./espece.model')}) public espece: Espece;
  @Field({model: import('./variete.model')}) public variete: Variete;
  @Field({model: import('./type.model')}) public type: Type;
  @Field({model: import('./mode-culture.model')}) public modeCulture: ModeCulture;
  @Field({model: import('./origine.model')}) public origine: Origine;
  @Field({model: import('./calibre-unifie.model')}) public calibreUnifie: CalibreUnifie;
  @Field({model: import('./type-vente.model')}) public typeVente: TypeVente;
  @Field({asKey: true, asLabel: true}) public id: string;
}

export default ArticleMatierePremiere;
