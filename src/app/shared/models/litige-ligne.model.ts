import Litige from './litige.model';
import {Field, Model, ModelName} from './model';

@ModelName('LitigeLigne')
export class LitigeLigne extends Model {
  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public commentaireResponsable?: string;
  @Field({model: import('./litige.model')}) public litige?: Litige;
}

export default LitigeLigne;
