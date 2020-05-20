import {BasePaiement, Devise, MoyenPaiement, Pays, RegimeTva, Societe, TypeFournisseur, BureauAchat, Historique} from './';

export class Fournisseur {

  public id: string;
  public code: string;
  public raisonSocial: string;
  public societe: Societe;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public langue: Pays;
  public latitude: string;
  public longitude: string;
  public devise: Devise;
  public moyenPaiement: MoyenPaiement;
  public basePaiement: BasePaiement;
  public regimeTva: RegimeTva;
  public nbJourEcheance: number;
  public echeanceLe: number;
  public tvaCee: string;
  public bureauAchat: BureauAchat;
  public margeObjectifEuroKilo: number;
  public margeObjectifPourcentCa: number;
  public stockActif: boolean;
  public stockPreca: boolean;
  public type: TypeFournisseur;
  public listeSocietes: string;
  public idTracabilite: string;
  public agrementBW: string;
  public codeStation: string;
  public compteComptable: string;
  public lieuFonctionEAN: string;
  public declarantCHEP: string;
  public formeJuridique: string;
  public siretAPE: string;
  public tvaCeeLibelle: string;
  public rcs: string;
  public suiviDestockage: boolean;
  public natureStation: string; // API = ENUM
  public referenceIfco: string;
  public dateDebutIfco: Date;
  public consignePaloxSa: boolean;
  public consignePaloxUdc: boolean;
  public listeExpediteurs: string;
  public valide: boolean;
  public historique: Historique[];

  // public incoterm: Incoterm; // Ne sert pas ?
  // public typeBureau: string;
  // public blocageAvoirEdi: boolean;
  // public debloquerEnvoieJour: boolean;
  // public instructionLogistique: string;
  // public referenceCoface: string;
  // public agrement: number;
  // public groupeFournisseur: GroupeFournisseur;
  // public soumisCtifl: boolean;
  // public autoFacturation: string;
  // public identTracabilite: string;
}
