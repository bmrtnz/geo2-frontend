import { Model, Field } from './model';

export class Utilisateur extends Model {

  @Field({asKey: true}) public nomUtilisateur: string;
  @Field() public nomInterne: string;

}
