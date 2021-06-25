import Fournisseur from './fournisseur.model';
import { Field, Model, ModelName } from './model';
import OrdreLogistique from './ordre-logistique.model';

@ModelName('OrdreLigneTotauxDetail')
export class OrdreLigneTotauxDetail extends Model {

  @Field() public totalNombrePalettesExpediees: number;
  @Field() public totalNombreColisExpedies: number;
  @Field() public totalPoidsNetExpedie: number;
  @Field() public totalPoidsBrutExpedie: number;
  @Field({model: import('./fournisseur.model')}) public fournisseur: Fournisseur;
  @Field({model: import('./ordre-logistique.model')}) public logistique: OrdreLogistique;

}

export default OrdreLigneTotauxDetail;
