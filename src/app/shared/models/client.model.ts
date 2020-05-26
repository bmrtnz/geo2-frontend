import { Entrepot } from './entrepot.model';
import { TypeTiers } from './tier.model';
import { Field, Model } from './model';
import { Societe } from './societe.model';
import { Secteur } from './secteur.model';
import { Pays } from './pays.model';
import { RegimeTva } from './regime-tva.model';
import { Incoterm } from './incoterm.model';
import { MoyenPaiement } from './moyen-paiement.model';
import { BasePaiement } from './base.paiement.model';
import { Devise } from './devise.model';
import { Personne } from './personne.model';
import { TypeClient } from './type.client.model';
import { GroupeClient } from './groupe-client.model';
import { BaseTarif } from './base-tarif.model';

export class Client extends Model {

  @Field() public id: string;
  @Field() public code: string;
  @Field() public raisonSocial: string;
  @Field({model: Societe}) public societe: Societe;
  @Field({model: Secteur}) public secteur: Secteur;
  @Field() public adresse1: string;
  @Field() public adresse2: string;
  @Field() public adresse3: string;
  @Field() public codePostal: string;
  @Field() public ville: string;
  @Field({model: Pays}) public pays: Pays;
  @Field() public facturationRaisonSocial: string;
  @Field() public facturationAdresse1: string;
  @Field() public facturationAdresse2: string;
  @Field() public facturationAdresse3: string;
  @Field() public facturationCodePostal: string;
  @Field() public facturationVille: string;
  @Field({model: Pays}) public facturationPays: Pays;
  @Field({model: RegimeTva}) public regimeTva: RegimeTva;
  @Field({model: Incoterm}) public incoterm: Incoterm;
  @Field() public nbJourEcheance: number;
  @Field() public echeanceLe: number;
  @Field({model: MoyenPaiement}) public moyenPaiement: MoyenPaiement;
  @Field() public tvaCee: string;
  @Field() public controlReferenceClient: string;
  @Field() public commentaireHautFacture: string;
  @Field() public commentaireBasFacture: string;
  @Field() public instructionCommercial: string;
  @Field() public siret: string;
  @Field() public blocageAvoirEdi: boolean;
  @Field() public debloquerEnvoieJour: boolean;
  @Field() public ifco: string;
  @Field() public instructionLogistique: string;
  @Field({model: BasePaiement}) public basePaiement: BasePaiement;
  @Field() public compteComptable: string;
  @Field({model: Pays}) public langue: Pays;
  @Field({model: Devise}) public devise: Devise;
  @Field({model: Personne}) public commercial: Personne;
  @Field({model: Personne}) public assistante: Personne;
  @Field() public referenceCoface: string;
  @Field() public agrement: number;
  @Field({model: BaseTarif}) public courtageModeCalcul: BaseTarif;
  @Field() public courtageValeur: number;
  @Field({model: TypeClient}) public typeClient: TypeClient;
  @Field({model: GroupeClient}) public groupeClient: GroupeClient;
  @Field() public soumisCtifl: boolean;
  // @Field({model: Entrepot}) public entrepots: Entrepot[];
  @Field() public typeTiers: TypeTiers;
  @Field() public lieuFonctionEan: string;
  @Field() public delaiBonFacturer: number;
}
