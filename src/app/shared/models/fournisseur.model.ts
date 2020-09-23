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
import { Certification } from './certification.model';
import { Stock } from './stock.model';

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
  @Field({filterValue: true, width: 100}) public valide: boolean;
  @Field() public preSaisie: boolean;
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
  @Field() public stockActif: boolean;
  @Field() public stockPrecalibre: boolean;
  @Field({model: TypeFournisseur}) public type: TypeFournisseur;
  @Field() public listeSocietes: string;
  @Field() public idTracabilite: string;
  @Field() public agrementBW: string;
  @Field() public codeStation: string;
  @Field() public compteComptable: string;
  @Field() public lieuFonctionEan: string;
  @Field() public declarantCHEP: boolean;
  @Field() public formeJuridique: string;
  @Field() public siretAPE: string;
  @Field() public rcs: string;
  @Field() public suiviDestockage: boolean;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public natureStation: NatureStation; // API = ENUM
  @Field() public referenceIfco: string;
  @Field({dataType: 'date'}) public dateDebutIfco: string;
  @Field() public consignePaloxSa: boolean;
  @Field() public consignePaloxUdc: boolean;
  @Field() public listeExpediteurs: string;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public typeTiers: TypeTiers;
  @Field() public autoFacturation: boolean;
  @Field() public tvaId: string;
  @Field({model: Historique}) public historique: Historique[];
  @Field() public indicateurModificationDetail: boolean;
  @Field({dataType: 'date'}) public dateConditionGeneraleAchatSignee: string;
  @Field() public declarantBacsCHEP: boolean;
  @Field({model: ConditionVente}) public conditionVente: ConditionVente;
  @Field({model: Fournisseur}) public fournisseurDeRattachement: Fournisseur;
  @Field({model: GroupeFournisseur}) public groupeFournisseur: GroupeFournisseur;
  @Field({model: Certification}) public certifications: Certification[];
  @Field({model: Stock}) public stocks: Stock[];

}
