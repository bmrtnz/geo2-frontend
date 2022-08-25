import BaseTarif from "./base-tarif.model";
import BasePaiement from "./base.paiement.model";
import { Campagne } from "./campagne.model";
import { Client } from "./client.model";
import Courtier from "./courtier.model";
import { Devise } from "./devise.model";
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
import Document from "./document.model";

export enum FactureAvoir {
  FACTURE = "F",
  AVOIR = "A",
}

export enum Statut {
  ANNULE = "Annulé" as any,
  A_FACTURER = "À facturer" as any,
  CONFIRME = "Confirmé" as any,
  EN_PREPARATION = "En préparation" as any,
  EXPEDIE = "Expédié" as any,
  FACTURE = "Facturé" as any,
  NON_CONFIRME = "Non confirmé" as any,
}

@ModelName("Ordre")
export class Ordre extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ model: import("./societe.model") }) public societe?: Societe;
  @Field({ model: import("./devise.model") }) public devise?: Devise;
  @Field() public commentaireUsageInterne?: string;
  @Field({ model: import("./campagne.model") }) public campagne?: Campagne;
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
  @Field({ model: import("./port.model") }) public portTypeD?: Port;
  @Field({ model: import("./port.model") }) public portTypeA?: Port;
  @Field({ model: import("./entrepot.model") }) public entrepot?: Entrepot;
  @Field({ dataType: "datetime" }) public dateDepartPrevue?: string;
  @Field({ dataType: "datetime" }) public dateLivraisonPrevue?: string;
  @Field() public venteACommission?: boolean;
  @Field() public bonAFacturer?: boolean;
  @Field() public facture?: boolean;
  @Field({ allowHeaderFiltering: false, allowSearch: false })
  public statut?: Statut;
  @Field() public factureEDI?: boolean;
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
  public prixUnitaireTarifCourtage?: number;
  @Field() public tauxRemiseFacture: number;
  @Field() public tauxRemiseHorsFacture: number;
  @Field() public remiseSurFactureMDDTaux: number;
  @Field({ model: import("./devise.model") }) public transporteurDEVCode?: Devise;
  @Field() public transporteurDEVTaux?: number;
  @Field({ model: import("./base-tarif.model") })
  public baseTarifTransport?: BaseTarif;
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
  @Field() public cqLignesCount?: number;
  @Field() public commentairesOrdreCount?: number;
  @Field() public hasLitige?: boolean;
  @Field() public exclusionFraisPU?: boolean;
  @Field() public codeAlphaEntrepot?: string;
  @Field() public bassinTransporteur?: string;
  @Field({ dataType: "datetime" }) public dateModification?: string;
  @Field({ dataType: "datetime" }) public dateCreation?: string;
  @Field({ model: import("./type-ordre.model") })
  public type?: TypeOrdre;
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
  @Field({ model: import("./document.model") }) public documentFacture: Document;
  @Field({ model: import("./document.model") }) public documentCMR: Document;

  public static isCloture(ordre: Partial<Ordre>) {
    if (!ordre?.statut) console.warn("Ordre is missing statut");
    return [
      Statut[Statut.EXPEDIE],
      Statut[Statut.FACTURE],
    ]
      .includes(ordre?.statut.toString());
  }

}

export default Ordre;
