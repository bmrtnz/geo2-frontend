import {
  Incoterm, Pays, RegimeTva, Societe,
  ModeLivraison, Personne, TypePalette,
  TypeCamion, Transitaire, Transporteur, BaseTarif
} from './';

export class Entrepot {
  public id: string;
  public code: string;
  public societe: Societe;
  public raisonSocial: string;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public langue: Pays;
  public incoterm: Incoterm;
  public tvaCee: string;
  public regimeTva: RegimeTva;
  public typePalette: TypePalette;
  public commercial: Personne;
  public assistante: Personne;
  public modeLivraison: ModeLivraison;
  public transporteur: Transporteur;
  public typeCamion: TypeCamion;
  public baseTarifTransport: BaseTarif;
  public transitaire: Transitaire;
  public baseTarifTransit: BaseTarif;
  public instructionSecretaireCommercial: string;
  public instructLogistique: string;
  public gestionnaireCHEP: string;
  public referenceCHEP: string;
  public lieuFonctionEANDepot: string;
  public lieuFonctionEANAcheteur: string;
  public declarationEUR1: boolean;
  public envoieAutomatiqueDetail: boolean;
  public controleRefClient: string;
  public mentionClientSurFacture: string;
  public valide: boolean;

  // ??
  public PUTarifTransport: string;
  public PUTarifTransit: string;

}

