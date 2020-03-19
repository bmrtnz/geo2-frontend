import {BasePaiement, Devise, Incoterm, MoyenPaiement, Pays, RegimeTva, Secteur, Societe} from './';

export class LieuPassageAQuai {

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
  public commentaireHautFacture: string;
  public commentaireBasFacture: string;
  public instructionCommercial: string;
  public siret: string;
  public blocageAvoirEdi: boolean;
  public debloquerEnvoieJour: boolean;
  public ifco: string;
  public instructionLogistique: string;
  public basePaiement: BasePaiement;
  public compteComptable: string;
  public langue: Pays;
  public devise: Devise;
  public lieuFonctionEAN: Devise;

}
