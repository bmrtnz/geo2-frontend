import {BasePaiement, Devise, Incoterm, MoyenPaiement, Pays, RegimeTva, Societe, TypeFournisseur} from './';

export class Fournisseur {

  public id: string;
  public code: string;
  public raisonSocial: string;
  public stockActif: boolean;
  public suiviPrecalibre: boolean;
  public societe: Societe;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public latitude: string;
  public longitude: string;
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
  public bureauAchat: string;
  public typeBureau: string;
  public basePaiement: BasePaiement;
  public compteComptable: string;
  public langue: Pays;
  public devise: Devise;
  public referenceCoface: string;
  public agrement: number;
  public typeFournisseur: TypeFournisseur;
  public soumisCtifl: boolean;
  public SiretAPE: string;
  public idTVA: string;
  public RCS: string;
  public autoFacturation: string;
  public identTracabilite: string;
  public agrementBW: string;
  public codeStation: string;
}
