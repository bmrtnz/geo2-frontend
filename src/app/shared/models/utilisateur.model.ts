import {Field, Model, ModelName} from './model';
import Secteur from './secteur.model';
import Personne from './personne.model';

@ModelName('Utilisateur')
export class Utilisateur extends Model {
  @Field({ asKey: true }) public nomUtilisateur?: string;
  @Field() public nomInterne?: string;
  @Field() public accessGeoTiers?: boolean;
  @Field() public accessGeoProduct?: boolean;
  @Field() public accessGeoOrdre?: boolean;
  @Field() public perimetre?: string;
  @Field() public limitationSecteur?: boolean;
  @Field({ model: import('./secteur.model') }) public secteurCommercial?: Secteur;
  @Field({ model: import('./personne.model') }) public commercial?: Personne;
  @Field({ model: import('./personne.model') }) public assistante?: Personne;
  @Field() public configTuilesOrdres?: any;
  @Field() public configTabsOrdres?: { [key: string]: string };
  @Field() public adminClient?: boolean;

  public getSUP?() {
    return [ this?.commercial, this?.assistante ]
    .filter( person => person?.indicateurPresentationSUP )
    .map( person => person.indicateurPresentationSUP )[0] ?? null;
  }
}

export default Utilisateur;
