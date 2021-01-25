import Entrepot from './entrepot.model';
import {Field, Model, ModelName} from './model';
import Societe from './societe.model';
import Utilisateur from './utilisateur.model';

@ModelName('MRUEntrepot')
export class MRUEntrepot extends Model {
  @Field({asKey: true}) public id: string;
  @Field({model: import('./utilisateur.model')}) public utilisateur: Utilisateur;
  @Field({model: import('./entrepot.model')}) public entrepot: Entrepot;
  @Field({model: import('./societe.model')}) public societe: Societe;
}

export default MRUEntrepot;
