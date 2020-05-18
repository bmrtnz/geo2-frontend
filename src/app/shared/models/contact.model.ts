import { Flux } from './flux.model';
import { Societe } from './societe.model';
import { TypeTiers } from './tier.model';

export class Contact {
  public id: string;
  public flux: Flux;
  public fluxAccess1: string;
  public fluxAccess2: string;
  public fluxComponent: string;
  public nom: string;
  public prenom: string;
  public societe: Societe;
  public valide: boolean;
  public typeTiers: TypeTiers;
}
