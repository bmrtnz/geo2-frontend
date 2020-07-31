import { Field, Model } from './model';
import { Espece } from './espece.model';

export class Marque extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({model: Espece}) public espece: Espece;
  get especeId() { return this.espece.id; }
}
