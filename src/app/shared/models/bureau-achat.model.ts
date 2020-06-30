import { Model, Field } from './model';

export class BureauAchat extends Model {
  @Field({asKey: true}) id: string;
  @Field({asLabel: true}) raisonSocial: string;
}
