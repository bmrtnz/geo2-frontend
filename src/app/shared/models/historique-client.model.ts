import Client from './client.model';
import Historique from './historique.model';
import { Field } from './model';

export class HistoriqueClient extends Historique {
  @Field({model: import('./client.model')}) public client: Client;
}

export default HistoriqueClient;
