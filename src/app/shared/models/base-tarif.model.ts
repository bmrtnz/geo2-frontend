import { Field, Model } from './model';

export class BaseTarif extends Model {
  @Field() public id: string;
  @Field() public description: string;
  @Field() public cku: string;
  @Field() public valideTrp: boolean;
  @Field() public valideLig: boolean;
  @Field() public valide: boolean;
}
