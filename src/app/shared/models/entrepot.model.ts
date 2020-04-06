import {Incoterm, Pays, RegimeTva, Societe, BaseTarifTransit,
     ModeLivraison, Personne, TypePalette, BaseTarifTransport,
      TypeCamion, Transitaire, Transporteur
} from './';

export class Entrepot {
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
public incoterm: Incoterm;
public tvaCee: string;
public regimeTva: RegimeTva;
public typePalette: TypePalette;
public transporteur: Transporteur;
public baseTarifTransport: BaseTarifTransport;
public typeCamion: TypeCamion;
public transitaire: Transitaire;
public baseTarifTransit: BaseTarifTransit;
public instructSecrComm: string;
public instructLogistique: string;
public gestionnaireCHEP: string;
public referenceCHEP: string;
public lieuFonctionEANDepot: string;
public lieuFonctionEANAcheteur: string;
public declarationEUR1: boolean;
public envoiAutoDetail: boolean;
public valide: boolean;
public mentionClientFacture: string;
public controleRefClient: string;
public commercial: Personne;
public assistante: Personne;
public modeLivraison: ModeLivraison;
public PUTarifTransport: string;
public PUTarifTransit: string;

}
