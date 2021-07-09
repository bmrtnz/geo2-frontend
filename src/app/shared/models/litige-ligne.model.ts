import Litige from './litige.model';
import ordreLigne, { OrdreLigne } from './ordre-ligne.model';
import { LitigeCause } from './litige-cause.model';
import { LitigeConsequence } from './litige-consequence.model';
import {Field, Model, ModelName} from './model';

@ModelName('LitigeLigne')
export class LitigeLigne extends Model {
  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public commentaireResponsable?: string;
  @Field({model: import('./litige.model')}) public litige?: Litige;
  @Field() public numeroGroupementLitige?: string;
  @Field({model: import('./litige-cause.model')}) public cause?: LitigeCause;
  @Field({model: import('./litige-consequence.model')}) public consequence?: LitigeCause;
  @Field() public consequenceLitigeCode?: string;
  @Field() public responsableTypeCode?: string;
  @Field() public tiersCode?: string;
  @Field({model: import('./ordre-ligne.model')}) public ordreLigne?: OrdreLigne;
  @Field() public numeroOrdreReplacement?: string;
  @Field() public ordreReferenceRemplacement?: string;
  @Field() public clientNombrePalettes?: number;
  @Field() public clientNombreColisReclamation?: number;
  @Field() public clientPoidsNet?: number;
  @Field() public clientPrixUnitaire?: number;
  @Field() public deviseCode?: string;
  @Field() public clientQuantite?: number;
  @Field() public clientUniteFactureCode?: string;
  @Field() public responsableNombrePalettes?: number;
  @Field() public responsableNombreColis?: number;
  @Field() public responsablePoidsNet?: number;
  @Field() public responsablePrixUnitaire?: number;
  @Field() public responsableQuantite?: number;
  @Field() public responsableUniteFactureCode?: string;
}

export default LitigeLigne;
