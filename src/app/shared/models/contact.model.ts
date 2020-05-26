import { Flux } from './flux.model';
import { Societe } from './societe.model';
import { TypeTiers } from './tier.model';
import { Model, Field } from './model';

export class Contact extends Model {
  @Field() public id: string;
  @Field({model: Flux}) public flux: Flux;
  @Field() public fluxAccess1: string;
  @Field() public fluxAccess2: string;
  @Field() public fluxComplement: string;
  @Field() public nom: string;
  @Field() public prenom: string;
  @Field({model: Societe}) public societe: Societe;
  @Field() public valide: boolean;
  @Field() public codeTiers: string;
  @Field() public typeTiers: TypeTiers|string;
}
