import { Model, ModelName, Field } from './model';
import Ordre from './ordre.model';

@ModelName('OrdreBaf')
export class OrdreBaf extends Model {
    @Field({ asKey: true }) public ordreRef: string;
    @Field({ asLabel: true }) public numeroOrdre: string;
    @Field() public client: string;
    @Field() public clientReference: string;
    @Field() public entrepot: string;
    @Field() public transporteur: string;
    @Field() public dateFr: string;
    @Field() public dateEN: string;

    @Field() public indicateurBaf: string;
    @Field() public indicateurPrix: string;
    @Field() public indicateurAutre: string;
    @Field() public indicateurQte: string;
    @Field() public indicateurTransporteur: string;
    @Field() public indicateurDate: string;
    @Field() public indicateurStation: string;
    @Field() public description: string;
    @Field({format: { type: 'percent', precision: 2 }}) public pourcentageMargeBrut: number;

    @Field({model: import('./ordre.model')}) public ordre: Ordre;
}

export default OrdreBaf;
