import { Article } from './article.model';
import { BaseTarif } from './base-tarif.model';
import Fournisseur from './fournisseur.model';
import { Field, Model, ModelName } from './model';
import OrdreLogistique from './ordre-logistique.model';
import { Ordre } from './ordre.model';
import Palette from './type-palette.model';

@ModelName('OrdreLigne')
export class OrdreLigne extends Model {

  @Field() public poidsBrutCommande: number;
  @Field() public poidsBrutExpedie: number;
  @Field() public poidsNetCommande: number;
  @Field() public poidsNetExpedie: number;
  @Field() public venteQuantite: number;
  @Field() public achatQuantite: number;
  @Field({model: import('./base-tarif.model')}) public venteUnite: BaseTarif;
  @Field({asKey: true, asLabel: true}) public id?: string;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({ model: import('./ordre-logistique.model') }) public logistique?: OrdreLogistique;
  @Field({model: import('./article.model')}) public article?: Article;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field({model: import('./base-tarif.model')}) public fraisUnite?: BaseTarif;
  @Field() public nombrePalettesCommandees?: number;
  @Field() public nombrePalettesExpediees?: number;
  @Field() public nombrePalettesIntermediaires?: number;
  @Field() public nombreColisPalette?: number;
  @Field() public nombreColisCommandes?: number;
  @Field() public libelleDLV?: string;
  @Field() public proprietaireMarchandise?: string;
  @Field() public ventePrixUnitaire?: number;
  @Field() public gratuit?: boolean;
  @Field() public achatPrixUnitaire?: number;
  @Field() public achatDevise?: string;
  @Field({model: import('./base-tarif.model')}) public achatUnite?: BaseTarif;
  @Field({model: import('./type-palette.model')}) public typePalette?: Palette;
  @Field({model: import('./type-palette.model')}) public paletteInter?: Palette;
  @Field() public fraisPrixUnitaire?: number;
  @Field() public tauxRemiseSurFacture?: number;
  @Field() public tauxRemiseHorsFacture?: number;
  @Field() public articleKit?: number;
  @Field() public gtinColisKit?: number;
  @Field() public numero?: string;
  @Field() public referenceProdet?: string;
  @Field() public nombreColisExpedies?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalVenteBrut?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalRemise?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalRestitue?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalFraisMarketing?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalAchat?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalObjectifMarge?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalTransport?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalTransit?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalCourtage?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalFraisAdditionnels?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public totalFraisPlateforme?: number;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public margeBrute?: number;
  @Field({format: { type: 'percent', precision: 2 }})
  public pourcentageMargeBrute?: number;
  @Field({format: { type: 'percent', precision: 2 }})
  public pourcentageMargeNette?: number;

}

export default OrdreLigne;
