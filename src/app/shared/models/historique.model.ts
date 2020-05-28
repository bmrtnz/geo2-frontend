import {Field, Model} from './model';

export class Historique extends Model {

  @Field() public id: string;
  @Field() public commentaire: string;
  @Field() public valide: boolean;
  @Field() public userModification: string;
  @Field() public dateModification: Date;

}
