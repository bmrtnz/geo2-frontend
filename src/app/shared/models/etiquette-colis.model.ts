import {Espece} from './espece.model';
import {Field, Model, ModelName} from './model';
import Etiquette from './etiquette.model';

@ModelName('EtiquetteColis')
export class EtiquetteColis extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({model: import('./espece.model')}) public espece: Espece;
  @Field({model: import('./etiquette.model')}) public etiquette: Etiquette;

  get especeId() { return this.espece.id; }
}

export default EtiquetteColis;
