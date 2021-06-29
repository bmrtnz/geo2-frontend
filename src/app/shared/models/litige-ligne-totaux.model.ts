import Devise from './devise.model';
import { Field, Model, ModelName } from './model';

@ModelName('LitigeLigneTotaux')
export class LitigeLigneTotaux extends Model {

  @Field() public avoirClient: number;
  @Field() public avoirClientTaux: number;
  @Field() public avoirFournisseur: number;
  @Field() public avoirFournisseurTaux: number;
  @Field() public ristourneTaux: number;
  @Field() public fraisAnnexes: number;
  @Field() public totalMontantRistourne: number;
  @Field({model: import('./devise.model')}) public devise: Devise;

}

export default LitigeLigneTotaux;
