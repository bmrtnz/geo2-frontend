import {Field, Model, ModelName} from './model';
import {Article} from './article.model';
import {Espece} from './espece.model';
import {Variete} from './variete.model';
import {CalibreMarquage} from './calibre-marquage.model';
import {Categorie} from './categorie.model';
import {Origine} from './origine.model';
import {Colis} from './colis.model';
import {CalibreFournisseur} from './calibre-fournisseur.model';

@ModelName('StockArticleAge')
export class StockArticleAge extends Model {

  @Field({model: import('./article.model')}) public article: Article;
  @Field({model: import('./variete.model')}) public variete: Variete;
  @Field({model: import('./categorie.model')}) public categorie: Categorie;
  @Field() public j: number;
  @Field() public j1a8: number;
  @Field() public j9a20: number;
  @Field() public j21aX: number;
  @Field() public total: number;
  @Field() public commentaire: string;
  @Field() public quantiteHebdomadaire: number;
  @Field() public prevision3j: number;
  @Field() public prevision7j: number;
  @Field({model: import('./espece.model')}) public espece: Espece;
  @Field({model: import('./calibre-fournisseur.model')}) public calibreFournisseur: CalibreFournisseur;
  @Field({model: import('./calibre-marquage.model')}) public calibreMarquage: CalibreMarquage;
  @Field({model: import('./origine.model')}) public origine: Origine;
  @Field({model: import('./colis.model')}) public colis: Colis;
  @Field({asKey: true, asLabel: true}) public age: string;
  // @Field() public dateModification: string;

}

export default StockArticleAge;
