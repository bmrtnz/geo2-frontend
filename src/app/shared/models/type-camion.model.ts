import { Field, Model } from './model';

export class TypeCamion extends Model {
    @Field({asKey: true}) public id: string;
    @Field({asLabel: true}) public description: string;
    @Field() public valide: boolean;
}
