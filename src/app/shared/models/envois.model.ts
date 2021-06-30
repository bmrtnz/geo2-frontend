import {Field, Model, ModelName} from './model';
import {Personne} from './personne.model';
import {Flux} from './flux.model';
import {Ordre} from './ordre.model';
import {TypeTiers} from './type-tiers.model';
import {MoyenCommunication} from './moyen-communication.model'

@ModelName('Envois')
export class Envois extends Model {
  @Field({asKey: true}) public id: string;
  @Field({model: import('./personne.model')}) public assistante: Personne;
  @Field({model: import('./personne.model')}) public commercial: Personne;
  @Field() public commentairesAvancement: string;
  @Field() public imprimanteID: string;
  @Field({ dataType: 'localdate ' }) public dateEnvoi?: string;
  @Field({ dataType: 'localdate ' }) public dateAccuseReception?: string;
  @Field({ dataType: 'localdate ' }) public dateDemande?: string;
  // @Field({ dataType: 'date ' }) public dateModification?: string;
  @Field({model: import('./flux.model')}) public flux: Flux;
  @Field({model: import('./moyen-communication.model')}) public moyenCommunication: MoyenCommunication;
  @Field() public nomFichier: string;
  @Field() public nombreTentatives: number;
  @Field() public numeroAcces1: string;
  @Field() public numeroOrdre: string;
  @Field({model: import('./ordre.model')}) public ordre: Ordre;
  @Field({model: import('./type-tiers.model')}) public typeTiers: TypeTiers;
  @Field() public codeTiers: string;
  // @Field() public userModification: string;
  @Field() public versionOrdre: string;
}

export default Envois;
