import LitigeLigne from './litige-ligne.model';
import { Field, Model, ModelName } from './model';
import Ordre from './ordre.model';

@ModelName('Litige')
export class Litige extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ model: import('./ordre.model') }) public ordreOrigine?: Ordre;
  @Field({ model: import('./litige-ligne.model') }) public lignes?: LitigeLigne[];
  @Field() public fraisAnnexes?: number;
}

export default Litige;