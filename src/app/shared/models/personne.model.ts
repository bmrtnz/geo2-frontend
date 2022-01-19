import {Field, Model, ModelName} from './model';

export enum Role {
  ASSISTANT = 'A',
  COMMERCIAL = 'C',
}
@ModelName('Personne')
export class Personne extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public nomUtilisateur: string;
  @Field() public prenom: string;
  @Field() public nom: string;
  @Field() public service: string;
  @Field() public imprimante: string;
  @Field() public email: string;
  @Field() public indicateurPresentationSUP: string;
  @Field() public valide: boolean;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public role?: Role;

  public nomPrenom() {
    return `${this.nom} ${this.prenom}`;
  }

}

export default Personne;
