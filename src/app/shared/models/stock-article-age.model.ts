import { Field, Model } from './model';
import { Article } from './article.model';
import { Espece } from './espece.model';
import { Variete } from './variete.model';
import { CalibreMarquage } from './calibre-marquage.model';
import { Categorie } from './categorie.model';
import { Origine } from './origine.model';
import { Colis } from './colis.model';
import { CalibreFournisseur } from './calibre-fournisseur.model';

export class StockArticleAge extends Model {

  @Field({model: Article}) public article: Article;
  @Field({model: Variete}) public variete: Variete;
  @Field({model: Categorie}) public categorie: Categorie;
  @Field({width: 60}) public j: number;
  @Field({width: 60}) public j1a8: number;
  @Field({width: 60}) public j9a20: number;
  @Field({width: 60}) public j21aX: number;
  @Field({width: 60}) public total: number;
  @Field({width: 150}) public commentaire: string;
  @Field() public quantiteHebdomadaire: number;
  @Field() public prevision3j: number;
  @Field() public prevision7j: number;
  @Field({model: Espece}) public espece: Espece;
  @Field({model: CalibreFournisseur}) public calibreFournisseur: CalibreFournisseur;
  @Field({model: CalibreMarquage}) public calibreMarquage: CalibreMarquage;
  @Field({model: Origine}) public origine: Origine;
  @Field({model: Colis}) public colis: Colis;
  @Field({asKey: true, asLabel: true}) public age: string;
  // @Field() public dateModification: string;

}
