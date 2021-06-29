import {Field, Model, ModelName} from './model';
import {Article} from './article.model';
import {Ordre} from './ordre.model';
import Fournisseur from './fournisseur.model';
import baseTarif, { BaseTarif } from './base-tarif.model';
import Palette from './type-palette.model';

@ModelName('OrdreLigne')
export class OrdreLigne extends Model {

  @Field({asKey: true, asLabel: true}) public id: string;
  @Field({model: import('./ordre.model')}) public ordre: Ordre;
  @Field({model: import('./article.model')}) public article: Article;
  @Field({model: import('./fournisseur.model')}) public fournisseur: Fournisseur;
  @Field({model: import('./base-tarif.model')}) public fraisUnite: BaseTarif;
  @Field() public nombrePalettesCommandees: number;
  @Field() public nombrePalettesIntermediaires: number;
  @Field() public nombreColisPalette: number;
  @Field() public nombreColisCommandes: number;
  @Field() public proprietaireMarchandise: string;
  @Field() public ventePrixUnitaire: number;
  @Field() public gratuit: boolean;
  @Field() public achatPrixUnitaire: number;
  @Field() public achatDevise: string;
  @Field({model: import('./base-tarif.model')}) public achatUnite: BaseTarif;
  @Field({model: import('./type-palette.model')}) public typePalette: Palette;
  @Field({model: import('./type-palette.model')}) public paletteInter: Palette;
  @Field() public fraisPrixUnitaire: number;
  @Field() public tauxRemiseSurFacture: number;
  @Field() public tauxRemiseHorsFacture: number;
  @Field() public articleKit: number;
  @Field() public gtinColisKit: number;

}

export default OrdreLigne;
