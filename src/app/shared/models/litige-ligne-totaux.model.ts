import Devise from './devise.model';
import { Field, Model, ModelName } from './model';

@ModelName('LitigeLigneTotaux')
export class LitigeLigneTotaux extends Model {

  @Field() public reclamationClientTaux: number;
  @Field() public reclamationClient: number;
  @Field() public deviseTotalTaux: number;
  @Field() public deviseTotal: number;
  @Field() public ristourne: number;
  @Field() public fraisAnnexes: number;
  @Field() public totalMontantRistourne: number;
  @Field({model: import('./devise.model')}) public devise: Devise;

}

export default LitigeLigneTotaux;
