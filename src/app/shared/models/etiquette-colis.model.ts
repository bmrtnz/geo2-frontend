import {Espece} from './espece.model';
import {Field, Model, ModelName} from './model';
import Document from './document.model';

@ModelName('EtiquetteColis')
export class EtiquetteColis extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field({model: import('./espece.model')}) public espece: Espece;
  @Field({model: import('./document.model')}) public document: Document;

  get especeId() { return this.espece.id; }
}

export default EtiquetteColis;
