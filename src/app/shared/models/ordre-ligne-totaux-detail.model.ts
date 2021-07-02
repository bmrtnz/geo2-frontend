import Fournisseur from './fournisseur.model';
import { Field, Model, ModelName } from './model';

@ModelName('OrdreLigneTotauxDetail')
export class OrdreLigneTotauxDetail extends Model {

  @Field() public totalNombrePalettesExpediees?: number;
  @Field() public totalNombreColisExpedies?: number;
  @Field() public totalPoidsNetExpedie?: number;
  @Field() public totalPoidsBrutExpedie?: number;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field() public nombrePalettesAuSol?: number;
  @Field() public nombrePalettes100x120?: number;
  @Field() public nombrePalettes80x120?: number;
  @Field() public nombrePalettes60X80?: number;

}

export default OrdreLigneTotauxDetail;
