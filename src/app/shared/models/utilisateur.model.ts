import {Field, Model, ModelName} from './model';
import Secteur from './secteur.model';

@ModelName('Utilisateur')
export class Utilisateur extends Model {
  @Field({ asKey: true }) public nomUtilisateur: string;
  @Field() public nomInterne: string;
  @Field() public accessGeoTiers: boolean;
  @Field() public accessGeoProduct: boolean;
  @Field() public accessGeoOrdre: boolean;
  @Field() public limitationSecteur: boolean;
  @Field({ model: import('./secteur.model') }) public secteurCommercial?: Secteur;
}

export default Utilisateur;
