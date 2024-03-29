import BaseTarif from "./base-tarif.model";
import BasePaiement from "./base.paiement.model";
import { Campagne } from "./campagne.model";
import { Client } from "./client.model";
import Courtier from "./courtier.model";
import { Devise } from "./devise.model";
import Document from "./document.model";
import Entrepot from "./entrepot.model";
import Incoterm from "./incoterm.model";
import { Field, Model, ModelName } from "./model";
import MoyenPaiement from "./moyen-paiement.model";
import { OrdreLigne } from "./ordre-ligne.model";
import { OrdreLogistique } from "./ordre-logistique.model";
import Pays from "./pays.model";
import Personne from "./personne.model";
import { Port } from "./port.model";
import RegimeTva from "./regime-tva.model";
import { Secteur } from "./secteur.model";
import { Societe } from "./societe.model";
import Transitaire from "./transitaire.model";
import Transporteur from "./transporteur.model";
import TypeCamion from "./type-camion.model";
import TypeOrdre from "./type-ordre.model";
import TypeVente from "./type-vente.model";

export enum FactureAvoir {
  FACTURE = "F",
  AVOIR = "A",
}

export enum Statut {
  ANNULE = "ANL",
  A_FACTURER = "AFC",
  CONFIRME = "CFM",
  EN_PREPARATION = "EPP",
  EXPEDIE = "EXP",
  FACTURE = "FCT",
  FACTURE_EDI = "FCT_EDI",
  NON_CONFIRME = "NCF",
}
export enum StatutLocale {
  ANNULE = "ordre-statut-anl",
  A_FACTURER = "ordre-statut-afc",
  CONFIRME = "ordre-statut-cfm",
  EN_PREPARATION = "ordre-statut-epp",
  EXPEDIE = "ordre-statut-exp",
  FACTURE = "ordre-statut-fct",
  FACTURE_EDI = "ordre-statut-fct_edi",
  NON_CONFIRME = "ordre-statut-ncf",
}

@ModelName("Ordre")
export class Ordre extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./societe.model") }) public societe?: Societe;
  @Field({ model: import("./devise.model") }) public devise?: Devise;
  @Field() public commentaireUsageInterne?: string;
  @Field({ model: import("./campagne.model") }) public campagne?: Campagne;
  @Field({ model: import("./edi-ordre.model") }) public ordreEDI?;
  @Field({ model: import("./ordre.model") }) public ordreDupliq?: Ordre;
  @Field({ model: import("./secteur.model") })
  public secteurCommercial?: Secteur;
  @Field({ model: import("./client.model") }) public client?: Client;
  @Field({ model: import("./ordre-ligne.model") })
  public lignes?: OrdreLigne[];
  @Field({ model: import("./ordre-logistique.model") })
  public logistiques?: OrdreLogistique[];
  @Field({ asLabel: true }) public numero?: string;
  @Field() public numeroFacture?: string;
  @Field() public referenceClient?: string;
  @Field({ model: import("./personne.model") }) public commercial?: Personne;
  @Field({ model: import("./personne.model") }) public assistante?: Personne;
  @Field({ model: import("./transporteur.model") })
  public transporteur?: Transporteur;
  @Field() public transporteurId?: string;
  @Field({ model: import("./port.model") }) public portTypeD?: Port;
  @Field({ model: import("./port.model") }) public portTypeA?: Port;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Partial<Entrepot>;
  @Field({ dataType: "datetime" }) public dateDepartPrevue?: string;
  @Field() public dateDepartPrevueBrute?: string;
  @Field({ dataType: "datetime" }) public dateLivraisonPrevue?: string;
  @Field() public venteACommission?: boolean;
  @Field() public bonAFacturer?: boolean;
  @Field() public facture?: boolean;
  @Field() public statut?: Statut;
  @Field() public factureEDI?: boolean;
  @Field() public flagAnnule?: boolean;
  @Field() public livre?: boolean;
  @Field() public instructionsLogistiques?: string;
  @Field() public codeClient?: string;
  @Field() public version?: string;
  @Field() public versionDetail?: string;
  @Field({ allowHeaderFiltering: false, allowSearch: false })
  public factureAvoir?: FactureAvoir;
  @Field() public codeChargement?: string;
  @Field() public echeanceNombreDeJours?: string;
  @Field() public echeanceLe: string;
  @Field() public pourcentageMargeBrut?: number;
  @Field() public tauxDevise?: number;
  @Field({ model: import("./type-camion.model") })
  public typeTransport?: TypeCamion;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public prixUnitaireTarifTransport?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public transporteurDEVPrixUnitaire?: number;
  @Field({ format: { type: "currency", precision: 2 }, currency: "EUR" })
  public prixUnitaireTarifCourtage?: number;
  @Field() public tauxRemiseFacture: number;
  @Field() public tauxRemiseHorsFacture: number;
  @Field() public remiseSurFactureMDDTaux: number;
  @Field({ model: import("./devise.model") })
  public transporteurDEVCode?: Devise;
  @Field() public transporteurDEVTaux?: number;
  @Field({ model: import("./base-tarif.model") })
  public baseTarifTransport?: Partial<BaseTarif>;
  @Field({ model: import("./base-tarif.model") })
  public baseTarifTransit?: BaseTarif;
  @Field({ model: import("./type-vente.model") })
  public typeVente?: TypeVente;
  @Field({ dataType: "localdate" }) public etdDate?: string;
  @Field({ dataType: "localdate" }) public etaDate?: string;
  // @Field() public etdLocation?: string;
  // @Field() public etaLocation?: string;
  @Field({ model: import("./incoterm.model") }) public incoterm?: Incoterm;
  @Field({ model: import("./pays.model") }) public pays?: Pays;
  @Field({ model: import("./regime-tva.model") })
  public regimeTva?: RegimeTva;
  @Field({ model: import("./moyen-paiement.model") })
  public moyenPaiement?: MoyenPaiement;
  @Field({ model: import("./base.paiement.model") })
  public basePaiement?: BasePaiement;
  @Field({ model: import("./courtier.model") }) public courtier?: Courtier;
  @Field({ model: import("./base-tarif.model") })
  public baseTarifCourtage?: BaseTarif;
  @Field({ model: import("./base-tarif.model") })
  public fraisUnite: BaseTarif;
  @Field() public fraisPrixUnitaire: number;
  @Field() public fraisPlateforme: number;
  @Field() public incotermLieu?: string;
  @Field() public fileCMR?: string;
  @Field() public listeOrdresComplementaires?: string;
  @Field() public listeOrdresRegularisations?: string;
  @Field() public ordreRefPaloxPere?: string;
  @Field() public listeOrdreRefPalox?: string;
  @Field() public listeNumeroOrigine?: string;
  @Field() public cqLignesCount?: number;
  @Field() public numeroCamion?: number;
  @Field() public ordreChargement?: number;
  @Field() public commentairesOrdreCount?: number;
  @Field() public totalNombrePalettesCommandees?: number;
  @Field() public totalNombrePalettesExpediees?: number;
  @Field() public hasLitige?: boolean;
  @Field() public exclusionFraisPU?: boolean;
  @Field() public codeAlphaEntrepot?: string;
  @Field() public bassinTransporteur?: string;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field({ dataType: "datetime" }) public dateCreation?: string;
  @Field({ model: import("./type-ordre.model") })
  public type?: TypeOrdre;
  public typeId?: TypeOrdre["id"];
  public campagneId?: Campagne["id"];
  @Field({
    allowSorting: false,
    allowHeaderFiltering: false,
    allowSearch: false,
  })
  public sommeColisCommandes?: number;
  @Field({
    allowSorting: false,
    allowHeaderFiltering: false,
    allowSearch: false,
  })
  public sommeColisExpedies?: number;
  @Field({ model: import("./transitaire.model") })
  public transitaire?: Transitaire;
  @Field({ model: import("./document.model") })
  public documentFacture: Document;
  @Field({ model: import("./document.model") }) public documentCMR: Document;
  @Field() public societeCode: string;
  @Field() public secteurCode: string;
  @Field() public numeroContainer: string;
  @Field() public descriptifRegroupement: string;
  @Field() public aBloquer?: boolean;

  public static isCloture(ordre: Partial<Ordre>) {
    if (!ordre?.statut) console.warn("Ordre is missing statut");
    return [
      Statut.EXPEDIE,
      Statut.A_FACTURER,
      Statut.FACTURE,
      Statut.FACTURE_EDI
    ].includes(Statut[ordre?.statut]);
  }
}

// etaLocation/etdLocation vs portTypeA/portTypeD
// GEO2 & GEO1 fonctionnement un peu différemment sur ces champs.
// GEO1 s'appuie sur eta/d_location
// GEO2 sur portTypeA/D
// Mais on s'assure de la compatibilité lors de la sauvegarde.

export default Ordre;
