import { Model, Field } from './model';
import { Societe } from './societe.model';
import { Secteur } from './secteur.model';
import { Client } from './client.model';
import { OrdreLigne } from './ordre-ligne.model';

export class Ordre extends Model {

  @Field({asKey: true}) public id: string;
  @Field({model: Societe}) public societe: Societe;
  @Field({model: Secteur}) public secteurCommercial: Secteur;
  @Field({model: Client}) public client: Client;
  @Field({model: OrdreLigne}) public lignes: OrdreLigne[];

}
