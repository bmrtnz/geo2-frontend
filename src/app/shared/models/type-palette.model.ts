import { Model, Field } from './model';

export class TypePalette extends Model {
    @Field() public id: string;
    @Field() public description: string;
    @Field() public valide: boolean;
    @Field() public codeEan: string;
    @Field() public consigne: boolean;
    @Field() public dimensions: string;
    @Field() public dimensionsSatar: string;
    @Field() public gestionnaireChep: string;
    @Field() public modifiedAt: string;
    @Field() public modifiedBy: string;
    @Field() public poids: number;
    @Field() public referenceChep: number;
}
