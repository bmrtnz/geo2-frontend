import { TypeTiers } from './tier.model';
import { Model, Field } from './model';
import { Pays } from './pays.model';
import { Devise } from './devise.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { RegimeTva } from './regime-tva.model';
import { BureauAchat } from './bureau-achat.model';
import { TypeFournisseur } from './type.fournisseur.model';
import { Historique } from './historique.model';
import { ConditionVente } from './condition-vente.model';
import { GroupeFournisseur } from './groupe-fournisseur.model';

export enum NatureStation {
  EXPEDITEUR_EMBALLEUR = 'O',
  STATION_NORMAL = 'N',
  EXCLUSIVEMENT_PROPRIETAIRE = 'E',
  EXCLUSIVEMENT_EXPEDITEUR = 'F'
}

export class Fournisseur extends Model {

  @Field({asKey: true, width: 150}) public id: string;
  @Field({asLabel: true}) public raisonSocial: string;
  @Field() public ville: string;
  @Field({model: Pays}) public pays: Pays;
  @Field({model: Devise}) public devise: Devise;
  @Field({model: Pays}) public langue: Pays;
  @Field({allowHeaderFiltering: false, filterValue: true, width: 100}) public valide: boolean;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public latitude: string;
  @Field() public longitude: string;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field() public tvaCee: string;
  @Field({model: BureauAchat}) public bureauAchat: BureauAchat;
  @Field() public margeObjectifEuroKilo: number;
  @Field() public margeObjectifPourcentCa: number;
  @Field({allowHeaderFiltering: false}) public stockActif: boolean;
  @Field({allowHeaderFiltering: false}) public stockPrecalibre: boolean;
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
  @Field({allowHeaderFiltering: false}) public suiviDestockage: boolean;
  @Field() public natureStation: string; // API = ENUM
  @Field() public referenceIfco: string;
  @Field() public dateDebutIfco: Date;
  @Field({allowHeaderFiltering: false}) public consignePaloxSa: boolean;
  @Field({allowHeaderFiltering: false}) public consignePaloxUdc: boolean;
  @Field() public listeExpediteurs: string;
  @Field() public typeTiers: TypeTiers;
  @Field({allowHeaderFiltering: false}) public autoFacturation: boolean;
  @Field() public tvaId: string;
  @Field({model: Historique}) public historique: Historique[];
  @Field({allowHeaderFiltering: false}) public indicateurModificationDetail: boolean;
  @Field() public dateConditionGeneraleAchatSignee: Date;
  @Field({allowHeaderFiltering: false}) public declarantBacsCHEP: boolean;
  @Field({model: ConditionVente}) public conditionVente: ConditionVente;
  @Field({model: Fournisseur}) public fournisseurDeRattachement: Fournisseur;
  @Field({model: GroupeFournisseur}) public groupeFournisseur: GroupeFournisseur;

}
