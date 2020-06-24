import { Flux } from './flux.model';
import { Societe } from './societe.model';
import { TypeTiers } from './tier.model';
import { Model, Field } from './model';

export class Contact extends Model {
  @Field({model: Societe}) public societe: Societe;
  @Field({model: Flux}) public flux: Flux;
  @Field() public fluxAccess1: string;
  @Field({asLabel: true}) public nom: string;
  @Field() public prenom: string;
  @Field() public valide: boolean;
  @Field() public fluxAccess2: string;
  @Field() public fluxComplement: string;
  @Field({asKey: true, allowEditing: false}) public id: string;
  @Field({allowEditing: false}) public codeTiers: string;
  @Field({allowEditing: false}) public typeTiers: TypeTiers|string;
}
