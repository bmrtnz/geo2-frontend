import { Field, Model } from './model';

export class Utilisateur extends Model {
  @Field({ asKey: true }) public nomUtilisateur: string;
  @Field() public nomInterne: string;
  @Field() public accessGeoTiers: boolean;
  @Field() public accessGeoProduct: boolean;
  @Field() public accessGeoOrdre: boolean;
}

export default Utilisateur;
