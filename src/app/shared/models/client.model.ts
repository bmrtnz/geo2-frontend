import {
  BasePaiement, Devise, Incoterm, Entrepot, MoyenPaiement, Pays, Personne, RegimeTva, Secteur, Societe,
  TypeClient, TypeVente, GroupeClient, Historique, Courtier, BaseTarif
} from './';

export class Client {

  public id: string;
  public code: string;
  public raisonSocial: string;
  public societe: Societe;
  public secteurId: string;
  public secteur: Secteur;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public facturationRaisonSocial: string;
  public facturationAdresse1: string;
  public facturationAdresse2: string;
  public facturationAdresse3: string;
  public facturationCodePostal: string;
  public facturationVille: string;
  public facturationPays: Pays;
  public regimeTva: RegimeTva;
  public incoterm: Incoterm;
  public nbJourEcheance: number;
  public echeanceLe: number;
  public moyenPaiement: MoyenPaiement;
  public tvaCee: string;
  public controlReferenceClient: string;
  public typeVente: TypeVente;
  public commentaireHautFacture: string;
  public commentaireBasFacture: string;
  public instructionCommercial: string;
  public siret: string;
  public blocageAvoirEdi: boolean;
  public debloquerEnvoieJour: boolean;
  public fraisRamasse: boolean;
  public clotureAutomatique: boolean;
  public ifco: string;
  public instructionLogistique: string;
  public basePaiement: BasePaiement;
  public compteComptable: string;
  public langue: Pays;
  public devise: Devise;
  public commercial: Personne;
  public assistante: Personne;
  public referenceCoface: string;
  public agrement: number;
  public courtier: Courtier;
  public courtageValeur: number;
  public typeClient: TypeClient;
  public groupeClient: GroupeClient;
  public soumisCtifl: boolean;
  public paramAvances: string;
  public entrepots: Entrepot[];
  public historique: Historique[];
  public paloxRaisonSocial: Client;
  public courtageModeCalcul: BaseTarif;
  public refusCoface: boolean;
  public fraisMarketingModeCalcul: BaseTarif;
  public enCoursDateLimite: Date;
  public dateDebutIfco: Date;
}
