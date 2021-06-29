import {Field, Model, ModelName} from './model';
import Ordre from './ordre.model';
import Utilisateur from './utilisateur.model';

@ModelName('OrdreSaveLog')
export class OrdreSaveLog extends Model {

  @Field({asKey: true}) public id?: string;
  @Field() public utilisateur?: string;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({ dataType: 'datetime' }) public dateModification?: string;

}

export default OrdreSaveLog;
