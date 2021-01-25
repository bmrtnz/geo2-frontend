import {Field, Model, ModelName} from './model';

@ModelName('BureauAchat')
export class BureauAchat extends Model {
  @Field({asKey: true}) id: string;
  @Field({asLabel: true}) raisonSocial: string;
}

export default BureauAchat;
