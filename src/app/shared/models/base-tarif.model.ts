import { Field, Model } from './model';

export class BaseTarif extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public cku: string;
  @Field() public valideTrp: boolean;
  @Field() public valideLig: boolean;
  @Field() public valide: boolean;
}

export default BaseTarif;
