import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Societe } from './societe.model';
import { Pays } from './pays.model';
import { Incoterm } from './incoterm.model';
import { RegimeTva } from './regime-tva.model';
import { TypePalette } from './type-palette.model';
import { Personne } from './personne.model';
import { Transporteur } from './transporteur.model';
import { TypeCamion } from './type-camion.model';
import { BaseTarif } from './base-tarif.model';
import { Transitaire } from './transitaire.model';
import { Client } from './client.model';

export enum ModeLivraison {
  DIRECT = 'D',
  CROSS_DOCK = 'X',
  SORTIE_STOCK = 'ST',
}

export class Entrepot extends Model {
  @Field({asKey: true, width: 150}) public id: string;
  @Field() public code: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public ville: string;
  @Field({model: import('./pays.model')}) public pays: Pays;
  @Field() public adresse1: string;
  @Field({filterValue: true, width: 100}) public valide: boolean;
  @Field() public preSaisie: boolean;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field({model: import('./pays.model')}) public langue: Pays;
  @Field({model: import('./incoterm.model')}) public incoterm: Incoterm;
  @Field() public tvaCee: string;
  @Field({model: import('./regime-tva.model')}) public regimeTva: RegimeTva;
  @Field({model: import('./type-palette.model')}) public typePalette: TypePalette;
  @Field({model: import('./personne.model')}) public commercial: Personne;
  @Field({model: import('./personne.model')}) public assistante: Personne;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public modeLivraison: ModeLivraison;
  @Field({model: import('./transporteur.model')}) public transporteur: Transporteur;
  @Field({model: import('./type-camion.model')}) public typeCamion: TypeCamion;
  @Field({model: import('./base-tarif.model')}) public baseTarifTransport: BaseTarif;
  @Field({model: import('./transitaire.model')}) public transitaire: Transitaire;
  @Field({model: import('./base-tarif.model')}) public baseTarifTransit: BaseTarif;
  @Field() public instructionSecretaireCommercial: string;
  @Field() public instructionLogistique: string;
  @Field() public gestionnaireChep: string;
  @Field() public referenceChep: string;
  @Field() public lieuFonctionEanDepot: string;
  @Field() public lieuFonctionEanAcheteur: string;
  @Field() public declarationEur1: boolean;
  @Field() public envoieAutomatiqueDetail: boolean;
  @Field() public controlReferenceClient: string;
  @Field() public mentionClientSurFacture: string;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public typeTiers: TypeTiers;
  @Field() public prixUnitaireTarifTransport: number;
  @Field() public prixUnitaireTarifTransit: number;
  @Field({model: import('./client.model')}) public client: Client;

}

export default Entrepot;
