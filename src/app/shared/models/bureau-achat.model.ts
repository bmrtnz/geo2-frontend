import { Model, Field } from './model';

export class BureauAchat extends Model {
  @Field() id: string;
  @Field() raisonSocial: string;
}
