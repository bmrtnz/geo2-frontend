import { Article } from './article.model';
import { Client } from './client.model';
import { Fournisseur } from './fournisseur.model';
import {Field, Model} from './model';

export abstract class Historique extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public commentaire: string;
  @Field() public valide: boolean;
  @Field() public userModification: string;
  @Field() public dateModification: Date;

}

export default Historique;
