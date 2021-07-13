import Devise from './devise.model';
import Frais from './frais.model';
import { Field, Model, ModelName } from './model';
import Ordre from './ordre.model';

@ModelName('OrdreFrais')
export class OrdreFrais extends Model {

  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public description?: string;
  @Field({model: import('./frais.model')}) public frais?: Frais;
  @Field({model: import('./devise.model')}) public devise?: Devise;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'}) public montant?: number;
  @Field() public deviseTaux?: number;
  @Field() public codePlus?: string;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'}) public montantTotal?: number;

}

export default OrdreFrais;
