import { Model, Field } from './model';
import { Espece } from './espece.model';

export class Cirage extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({model: import('./espece.model')}) public espece: Espece;
  get especeId() { return this.espece.id; }
}

export default Cirage;
