import { Pays } from './pays.model';
import { Model, Field } from './model';

export class Societe extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public ville: string;
  @Field({model: import('./pays.model')}) public pays: Pays;

}

export default Societe;
