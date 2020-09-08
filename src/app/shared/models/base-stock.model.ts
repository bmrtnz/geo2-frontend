import { Field, Model } from './model';
import { Fournisseur } from './fournisseur.model';
import { Espece } from './espece.model';

export abstract class BaseStock extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: Fournisseur}) public fournisseur: Fournisseur;
  @Field({model: Espece}) public espece: Espece;
  @Field() public valide: boolean;

}
