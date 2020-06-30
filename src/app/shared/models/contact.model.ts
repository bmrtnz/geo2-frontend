import { Flux } from './flux.model';
import { Societe } from './societe.model';
import { TypeTiers } from './tier.model';
import { MoyenCommunication } from './moyen-communication.model';
import { Model, Field } from './model';

export class Contact extends Model {
  @Field({model: MoyenCommunication}) public moyenCommunication: MoyenCommunication;
  @Field({model: Flux}) public flux: Flux;
  @Field() public fluxComplement: string;
  @Field() public fluxAccess1: string;
  @Field({asLabel: true}) public nom: string;
  @Field() public prenom: string;
  @Field() public valide: boolean;
  // @Field() public fluxAccess2: string;
  @Field({model: Societe}) public societe: Societe;
  @Field({asKey: true, allowEditing: false}) public id: string;
  @Field({allowEditing: false}) public codeTiers: string;
  @Field({allowEditing: false}) public typeTiers: TypeTiers|string;
}
