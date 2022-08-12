import { BaseTarif } from "./base-tarif.model";
import { BasePaiement } from "./base.paiement.model";
import CertificationClient from "./certification-client.model";
import { ConditionVente } from "./condition-vente.model";
import { Courtier } from "./courtier.model";
import { Devise } from "./devise.model";
import { Entrepot } from "./entrepot.model";
import { GroupeClient } from "./groupe-client.model";
import { Historique } from "./historique.model";
import { Incoterm } from "./incoterm.model";
import { Field, Model, ModelName } from "./model";
import { MoyenPaiement } from "./moyen-paiement.model";
import { Pays } from "./pays.model";
import { Personne } from "./personne.model";
import { RegimeTva } from "./regime-tva.model";
import { Secteur } from "./secteur.model";
import { Societe } from "./societe.model";
import { TypeTiers } from "./tier.model";
import { TypeVente } from "./type-vente.model";
import { TypeClient } from "./type.client.model";

@ModelName("Client")
export class Client extends Model {
  @Field({ asKey: true }) public id: string;
  @Field() public code: string;
  @Field({ asLabel: true }) public raisonSocial: string;
  @Field() public ville: string;
  @Field({ model: import("./pays.model") }) public pays: Pays;
  @Field({ model: import("./secteur.model") }) public secteur: Secteur;
  @Field() public valide: boolean;
  @Field() public preSaisie: boolean;
  @Field({ model: import("./societe.model") }) public societe: Societe;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public facturationRaisonSocial: string;
  @Field() public facturationAdresse1: string;
  @Field() public facturationAdresse2: string;
  @Field() public facturationAdresse3: string;
  @Field() public facturationCodePostal: string;
  @Field() public facturationVille: string;
  @Field({ model: import("./pays.model") }) public facturationPays: Pays;
  @Field({ model: import("./regime-tva.model") }) public regimeTva: RegimeTva;
  @Field({ model: import("./incoterm.model") }) public incoterm: Incoterm;
  @Field() public nbJourEcheance: string;
  @Field() public echeanceLe: string;
  @Field({ model: import("./moyen-paiement.model") })
  public moyenPaiement: MoyenPaiement;
  @Field() public tvaCee: string;
  @Field() public controlReferenceClient: string;
  @Field() public commentaireHautFacture: string;
  @Field() public commentaireBasFacture: string;
  @Field() public instructionCommercial: string;
  @Field() public siret: string;
  @Field() public blocageAvoirEdi: boolean;
  @Field() public modificationDetail: boolean;
  @Field() public debloquerEnvoieJour: boolean;
  @Field() public ifco: string;
  @Field() public instructionLogistique: string;
  @Field({ model: import("./base.paiement.model") })
  public basePaiement: BasePaiement;
  @Field() public compteComptable: string;
  @Field({ model: import("./pays.model") }) public langue: Pays;
  @Field({ model: import("./devise.model") }) public devise: Devise;
  @Field() public deviseTauxFix: number;
  @Field({ dataType: "date" }) public dateDeviseTauxFix: string;
  @Field({ model: import("./personne.model") }) public commercial: Personne;
  @Field({ model: import("./personne.model") }) public assistante: Personne;
  @Field() public referenceCoface: string;
  @Field({ model: import("./base-tarif.model") })
  public courtageModeCalcul: BaseTarif;
  @Field() public courtageValeur: number;
  @Field({ model: import("./type.client.model") })
  public typeClient: TypeClient;
  @Field({ model: import("./groupe-client.model") })
  public groupeClient: GroupeClient;
  @Field() public soumisCtifl: boolean;
  @Field({ model: import("./entrepot.model") }) public entrepots: Entrepot[];
  @Field({ allowHeaderFiltering: false, allowSearch: false })
  public typeTiers: TypeTiers;
  @Field() public lieuFonctionEan: string;
  @Field() public delaiBonFacturer: number;
  @Field({ model: import("./historique.model") })
  public historique: Historique[];
  @Field({ model: import("./type-vente.model") }) public typeVente: TypeVente;
  @Field({ dataType: "date" }) public dateDebutIfco: string;
  @Field() public refusCoface: boolean;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public agrement: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCoursTemporaire: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCoursBlueWhale: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public autorise: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public depassement: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCoursActuel: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCoursNonEchu: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCours1a30: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCours31a60: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCours90Plus: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public alerteCoface: number;
  @Field({
    format: { type: "currency", precision: 2 },
    currency: "EUR",
  })
  public enCoursDouteux: number;
  @Field({ dataType: "datetime" }) public enCoursDateLimite: string;
  @Field() public tauxRemiseParFacture: number;
  @Field() public tauxRemiseHorsFacture: number;
  @Field() public remiseSurFactureMDDTaux: number;
  @Field() public fraisExcluArticlePasOrigineFrance: boolean;
  @Field() public fraisMarketing: number;
  @Field({ model: import("./base-tarif.model") })
  public fraisMarketingModeCalcul: BaseTarif;
  @Field() public fraisPlateforme: number;
  @Field({ model: import("./courtier.model") }) public courtier: Courtier;
  @Field({
    model: import("./client.model"),
    allowHeaderFiltering: false,
    allowSearch: false,
  })
  public paloxRaisonSocial: Client;
  @Field() public formatDluo: string;
  @Field() public nbJourLimiteLitige: number;
  @Field() public clotureAutomatique: boolean;
  @Field() public detailAutomatique: boolean;
  @Field() public fraisRamasse: boolean;
  @Field() public venteACommission: boolean;
  @Field({ model: import("./condition-vente.model") })
  public conditionVente: ConditionVente;
  @Field({
    model: import("./certification-client.model"),
    allowSearch: false,
  })
  public certifications: CertificationClient[];
  @Field() public usageInterne: boolean;
  @Field() public paloxGratuit: boolean;
  @Field() public consignePalox: boolean;
  @Field() public releveFactures: boolean;
  @Field() public identifiantFiscal: string;
}

export default Client;
