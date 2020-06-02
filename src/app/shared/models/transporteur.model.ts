import { Client } from './client.model';
import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Pays } from './pays.model';
import { RegimeTva } from './regime-tva.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { Devise } from './devise.model';

export class Transporteur extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field({model: Pays}) public pays: Pays;
  @Field() public ville: string;
  @Field() public codePostal: string;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field() public tvaCee: string;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field() public compteComptable: string;
  @Field({model: Pays}) public langue: Pays;
  @Field({model: Devise}) public devise: Devise;
  @Field() public lieuFonctionEan: string;
  @Field({model: Client}) public clientRaisonSocial: Client;
  @Field() public typeTiers: TypeTiers;
  @Field() public valide: boolean;

}
