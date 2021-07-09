import { Field, Model, ModelName } from './model';
import Ordre from './ordre.model';
import TracabiliteLigne from './tracabilite-ligne.model';
import TypePalette from './type-palette.model';

@ModelName('TracabiliteDetailPalette')
export class TracabiliteDetailPalette extends Model {

  @Field({asKey: true}) public id?: number;
  @Field({asLabel: true}) public SSCC?: string;
  @Field() public poidsNet?: number;
  @Field() public poidsBrut?: number;
  @Field() public paletteAuSol?: boolean;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({model: import('./type-palette.model')}) public typePalette?: TypePalette;
  @Field({model: import('./tracabilite-ligne.model')}) public tracabiliteLignes?: TracabiliteLigne[];

}

export default TracabiliteDetailPalette;
