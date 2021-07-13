import {Field, Model, ModelName} from './model';
import {Fournisseur} from './fournisseur.model';
import {Ordre} from './ordre.model';
import Groupage from './groupage.model';
import Transporteur from './transporteur.model';

@ModelName('OrdreLogistique')
export class OrdreLogistique extends Model {

  @Field({asKey: true, asLabel: true}) public id?: string;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field() public expedieStation?: boolean;
  @Field() public nombrePalettesAuSol?: number;
  @Field() public nombrePalettes100x120?: number;
  @Field() public nombrePalettes80x120?: number;
  @Field() public nombrePalettes60X80?: number;
  @Field() public totalPalettesExpediees?: number;
  @Field() public numeroImmatriculation?: string;
  @Field() public numeroContainer?: string;
  @Field() public certificatControle?: string;
  @Field() public numeroPlomb?: string;
  @Field() public locusTrace?: string;
  @Field() public detecteurTemperature?: string;
  @Field() public certificatPhytosanitaire?: string;
  @Field() public billOfLanding?: string;
  @Field({ dataType: 'localdate' }) public dateDepartPrevueFournisseur?: string;
  @Field({ dataType: 'localdate' }) public dateDepartReelleFournisseur?: string;
  @Field({ dataType: 'localdate' }) public dateDepartPrevueGroupage?: string;
  @Field({model: import('./groupage.model')}) public groupage?: Groupage;
  @Field({model: import('./transporteur.model')}) public transporteurGroupage?: Transporteur;

}

export default OrdreLogistique;
