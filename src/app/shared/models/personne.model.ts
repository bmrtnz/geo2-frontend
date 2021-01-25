import {Field, Model, ModelName} from './model';

@ModelName('Personne')
export class Personne extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public nomUtilisateur: string;
  @Field() public prenom: string;
  @Field() public nom: string;
  @Field() public service: string;
  @Field() public imprimante: string;
  @Field() public email: string;
  @Field() public valide: boolean;

  public nomPrenom() {
    return `${this.nom} ${this.prenom}`;
  }

}

export default Personne;
