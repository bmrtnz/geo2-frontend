import { EdiLigne } from "./edi-ligne.model";
import { Article } from "./article.model";
import { BaseTarif } from "./base-tarif.model";
import CodePromo from "./code-promo.model";
import { BureauAchat } from "./bureau-achat.model";
import Fournisseur from "./fournisseur.model";
import { Field, Model, ModelName } from "./model";
import OrdreLogistique from "./ordre-logistique.model";
import { Ordre } from "./ordre.model";
import StockMouvement from "./stock-mouvement.model";
import Palette from "./type-palette.model";

@ModelName("OrdreLigne")
export class OrdreLigne extends Model {
  @Field() public poidsBrutCommande: number;
  @Field() public poidsBrutExpedie: number;
  @Field() public poidsNetCommande: number;
  @Field() public poidsNetExpedie: number;
  @Field() public venteQuantite: number;
  @Field() public achatQuantite: number;
  @Field({ model: import("./base-tarif.model") }) public venteUnite: Partial<BaseTarif>;
  @Field({ model: import("./bureau-achat.model") }) public bureauAchat: BureauAchat;
  @Field({ asKey: true, asLabel: true }) public id?: string;
  @Field({ model: import("./ordre.model") }) public ordre?: Ordre;
  @Field({ model: import("./edi-ligne.model") }) public ediLigne?: EdiLigne;
  @Field({ model: import("./ordre-logistique.model") })
  public logistique?: OrdreLogistique;
  @Field({ model: import("./article.model") }) public article?: Article;
  @Field({ model: import("./fournisseur.model") })
  public fournisseur?: Partial<Fournisseur>;
  @Field({ model: import("./base-tarif.model") }) public fraisUnite?: BaseTarif;
  @Field() public nombrePalettesCommandees?: number;
  @Field() public nombrePalettesExpediees?: number;
  @Field() public nombrePalettesIntermediaires?: number;
  @Field() public nombreColisPalette?: number;
  @Field() public nombreColisCommandes?: number;
  @Field() public libelleDLV?: string;
  @Field({ model: import("./fournisseur.model") })
  public proprietaireMarchandise?: Partial<Fournisseur>;
  @Field() public ventePrixUnitaire?: number;
  @Field() public gratuit?: boolean;
  @Field({ model: import("./code-promo.model") }) public codePromo?: CodePromo;
  @Field() public achatPrixUnitaire?: number;
  @Field() public achatDevise?: string;
  @Field() public achatDevisePrixUnitaire?: number;
  @Field() public achatDeviseTaux?: number;
  @Field() public fraisCommentaires?: string;
  @Field() public origineCertification?: string;
  @Field() public listeCertifications?: string;
  @Field({ model: import("./base-tarif.model") }) public achatUnite?: BaseTarif;
  @Field({ model: import("./type-palette.model") })
  public typePalette?: Partial<Palette>;
  @Field({ model: import("./type-palette.model") })
  public paletteInter?: Partial<Palette>;
  @Field() public fraisPrixUnitaire?: number;
  @Field() public tauxRemiseSurFacture?: number;
  @Field() public tauxRemiseHorsFacture?: number;
  @Field() public articleKit?: number;
  @Field() public gtinColisKit?: number;
  @Field() public numero?: string;
  @Field() public referenceProdet?: string;
  @Field() public nombreColisExpedies?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalVenteBrut?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalRemise?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalRestitue?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalFraisMarketing?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalAchat?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalObjectifMarge?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalTransport?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalTransit?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalCourtage?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalFraisAdditionnels?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public totalFraisPlateforme?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public margeBrute?: number;
  @Field({ format: { type: "percent", precision: 2 } })
  public pourcentageMargeBrute?: number;
  @Field({ format: { type: "percent", precision: 2 } })
  public pourcentageMargeNette?: number;
  @Field() public valide?: boolean;
  @Field({ model: import("./stock-mouvement.model") })
  public mouvement?: StockMouvement;
  @Field() public nombreReservationsSurStock?: number;
  @Field() public ristourne?: boolean;
  @Field() public indicateurPalette?: number;
  @Field() public nombreColisPaletteByDimensions?: number;

  static formatNumero(index: number) {
    return index.toString().padStart(2, "0");
  }
}

export default OrdreLigne;
