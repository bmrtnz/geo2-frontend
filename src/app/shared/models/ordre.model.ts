import { Model, Field } from './model';
import { Societe } from './societe.model';
import { Secteur } from './secteur.model';
import { Client } from './client.model';
import { OrdreLigne } from './ordre-ligne.model';

export class Ordre extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: import('./societe.model')}) public societe: Societe;
  @Field({model: import('./secteur.model')}) public secteurCommercial: Secteur;
  @Field({model: import('./client.model')}) public client: Client;
  @Field({model: import('./ordre-ligne.model')}) public lignes: OrdreLigne[];

}

export default Ordre;
