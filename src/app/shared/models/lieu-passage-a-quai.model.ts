import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Pays } from './pays.model';
import { RegimeTva } from './regime-tva.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { Devise } from './devise.model';

export class LieuPassageAQuai extends Model {

  @Field() public id: string;
  @Field() public raisonSocial: string;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public ville: string;
  @Field({model: Pays}) public pays: Pays;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field() public tvaCee: string;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field({model: Pays}) public langue: Pays;
  @Field({model: Devise}) public devise: Devise;
  @Field() public lieuFonctionEan: string;
  @Field() public typeTiers: TypeTiers;
  @Field() public valide: boolean;

}
