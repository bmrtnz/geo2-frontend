import Certification from './certification.model';
import Fournisseur from './fournisseur.model';
import {Field, Model, ModelName} from './model';

@ModelName('CertificationFournisseur')
export class CertificationFournisseur extends Model {

  @Field({asKey: true}) public id?: number;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field({model: import('./certification.model')}) public certification?: Certification;
  @Field({dataType: 'date'}) public dateValidite?: string;

}

export default CertificationFournisseur;
