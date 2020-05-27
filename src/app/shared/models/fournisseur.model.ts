import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Pays } from './pays.model';
import { Devise } from './devise.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { RegimeTva } from './regime-tva.model';
import { BureauAchat } from './bureau-achat.model';
import { TypeFournisseur } from './type.fournisseur.model';

export class Fournisseur extends Model {

  @Field() public id: string;
  @Field() public raisonSocial: string;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public ville: string;
  @Field({model: Pays}) public pays: Pays;
  @Field({model: Pays}) public langue: Pays;
  @Field() public latitude: string;
  @Field() public longitude: string;
  @Field({model: Devise}) public devise: Devise;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field() public tvaCee: string;
  @Field({model: BureauAchat}) public bureauAchat: BureauAchat;
  @Field() public margeObjectifEuroKilo: number;
  @Field() public margeObjectifPourcentCa: number;
  @Field() public stockActif: boolean;
  @Field() public stockPrecalibre: boolean;
  @Field({model: TypeFournisseur}) public type: TypeFournisseur;
  @Field() public listeSocietes: string;
  @Field() public idTracabilite: string;
  @Field() public agrementBW: string;
  @Field() public codeStation: string;
  @Field() public compteComptable: string;
  @Field() public lieuFonctionEan: string;
  @Field() public declarantCHEP: string;
  @Field() public formeJuridique: string;
  @Field() public siretAPE: string;
  @Field() public rcs: string;
  @Field() public suiviDestockage: boolean;
  @Field() public natureStation: string; // API = ENUM
  @Field() public referenceIfco: string;
  @Field() public dateDebutIfco: Date;
  @Field() public consignePaloxSa: boolean;
  @Field() public consignePaloxUdc: boolean;
  @Field() public listeExpediteurs: string;
  @Field() public valide: boolean;
  @Field() public typeTiers: TypeTiers;
  @Field() public autoFacturation: boolean;
  @Field() public tvaId: string;
}
