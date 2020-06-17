import { Model, Field } from './model';
import { Stickeur } from './stickeur.model';
import { Marque } from './marque.model';
import { EtiquetteColis } from './etiquette-colis.model';
import { EtiquetteUc } from './etiquette-UC.model';
import { EtiquetteEvenementielle } from './etiquette-evt.model';

export class ArticleNormalisation extends Model {
  @Field({asKey: true, asLabel: true}) public id: string;
  @Field({model: Stickeur}) public stickeur: Stickeur;
  @Field({model: Marque}) public marque: Marque;
  @Field({model: EtiquetteColis}) public etiquetteColis: EtiquetteColis;
  @Field({model: EtiquetteUc}) public etiquetteUc: EtiquetteUc;
  @Field({model: EtiquetteEvenementielle}) public etiquetteEvenementielle: EtiquetteEvenementielle;
  @Field() public gtinUc: string;
  @Field() public gtinColis: string;
  @Field() public articleClient: string;
}
