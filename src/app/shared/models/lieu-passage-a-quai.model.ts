import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Pays } from './pays.model';
import { RegimeTva } from './regime-tva.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { Devise } from './devise.model';

export class LieuPassageAQuai extends Model {

  @Field({asKey: true, width: 150}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public ville: string;
  @Field({model: Pays}) public pays: Pays;
  @Field() public codePostal: string;
  @Field() public adresse1: string;
  @Field({filterValue: true, width: 100}) public valide: boolean;
  @Field() public preSaisie: boolean;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field() public tvaCee: string;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field({model: Pays}) public langue: Pays;
  @Field({model: Devise}) public devise: Devise;
  @Field() public lieuFonctionEan: string;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public typeTiers: TypeTiers;

}
