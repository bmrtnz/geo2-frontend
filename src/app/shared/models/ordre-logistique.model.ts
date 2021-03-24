import {Field, Model, ModelName} from './model';
import {Fournisseur} from './fournisseur.model';
import {Ordre} from './ordre.model';
import Groupage from './groupage.model';

@ModelName('OrdreLogistique')
export class OrdreLogistique extends Model {

  @Field({asKey: true, asLabel: true}) public id?: string;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field() public expedieStation?: boolean;
  @Field({ dataType: 'localdate' }) public dateDepartPrevueFournisseur?: string;
  @Field({ dataType: 'localdate' }) public dateDepartPrevueGroupage?: string;
  @Field({model: import('./groupage.model')}) public groupage?: Groupage;

}

export default OrdreLogistique;
