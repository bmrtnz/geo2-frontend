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
  @Field({model: Pays}) public pays: Pays;
  @Field() public adresse1: string;
  @Field({filterValue: true, width: 100}) public valide: boolean;
  @Field() public preSaisie: boolean;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field({model: Pays}) public langue: Pays;
  @Field({model: Incoterm}) public incoterm: Incoterm;
  @Field() public tvaCee: string;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field({model: TypePalette}) public typePalette: TypePalette;
  @Field({model: Personne}) public commercial: Personne;
  @Field({model: Personne}) public assistante: Personne;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public modeLivraison: ModeLivraison;
  @Field({model: Transporteur}) public transporteur: Transporteur;
  @Field({model: TypeCamion}) public typeCamion: TypeCamion;
  @Field({model: BaseTarif}) public baseTarifTransport: BaseTarif;
  @Field({model: Transitaire}) public transitaire: Transitaire;
  @Field({model: BaseTarif}) public baseTarifTransit: BaseTarif;
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
  @Field({model: Client}) public client: Client;

}
