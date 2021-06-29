import {Field, Model, ModelName} from './model';
import Ordre from './ordre.model';
import Utilisateur from './utilisateur.model';

@ModelName('OrdreSaveLog')
export class OrdreSaveLog extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: import('./utilisateur.model')}) public utilisateur: Utilisateur;
  @Field({model: import('./ordre.model')}) public ordre: Ordre;

}

export default OrdreSaveLog;
