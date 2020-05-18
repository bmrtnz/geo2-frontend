import {BasePaiement, Devise, Incoterm, MoyenPaiement, Pays, RegimeTva, Secteur} from './';
import { Client } from './client.model';
import { TypeTiers } from './tier.model';

export class Transporteur {

  public id: string;
  public code: string;
  public raisonSocial: string;
  public secteur: Secteur;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public regimeTva: RegimeTva;
  public incoterm: Incoterm;
  public nbJourEcheance: number;
  public echeanceLe: number;
  public moyenPaiement: MoyenPaiement;
  public tvaCee: string;
  public instructionCommercial: string;
  public basePaiement: BasePaiement;
  public compteComptable: string;
  public langue: Pays;
  public devise: Devise;
  public lieuFonctionEAN: string;
  public clientRaisonSocial: Client;
  public typeTiers: TypeTiers;

}
