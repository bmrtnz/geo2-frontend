import Entrepot from './entrepot.model';
import {Field, Model, ModelName} from './model';
import Societe from './societe.model';
import Utilisateur from './utilisateur.model';

@ModelName('MRUEntrepot')
export class MRUEntrepot extends Model {
  @Field({asKey: true, asLabel: true}) public codeEntrepot: string;
  @Field({model: import('./utilisateur.model')}) public utilisateur: Utilisateur;
  @Field({model: import('./entrepot.model')}) public entrepot: Entrepot;
  @Field({model: import('./societe.model')}) public societe: Societe;
  @Field({ dataType: 'datetime' }) public dateModification: string;
}

export default MRUEntrepot;
