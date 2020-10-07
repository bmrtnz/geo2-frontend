import Fournisseur from './fournisseur.model';
import Historique from './historique.model';
import { Field } from './model';

export class HistoriqueFournisseur extends Historique {
  @Field({model: import('./fournisseur.model')}) public fournisseur: Fournisseur;
}

export default HistoriqueFournisseur;
