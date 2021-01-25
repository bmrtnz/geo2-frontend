import {Espece} from './espece.model';
import {Field, Model, ModelName} from './model';

@ModelName('EtiquetteEvenementielle')
export class EtiquetteEvenementielle extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({model: import('./espece.model')}) public espece: Espece;
  get especeId() { return this.espece.id; }
}

export default EtiquetteEvenementielle;
