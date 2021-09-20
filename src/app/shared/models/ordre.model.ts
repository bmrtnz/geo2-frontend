import {Client} from './client.model';
import Entrepot from './entrepot.model';
import {Field, Model, ModelName} from './model';
import {OrdreLigne} from './ordre-ligne.model';
import { OrdreLogistique } from './ordre-logistique.model';
import Personne from './personne.model';
import {Secteur} from './secteur.model';
import {Societe} from './societe.model';
import {Devise} from './devise.model';
import {Campagne} from './campagne.model';
import Transporteur from './transporteur.model';
import TypeCamion from './type-camion.model';
import BaseTarif from './base-tarif.model';
import Incoterm from './incoterm.model';

export enum FactureAvoir {
  FACTURE = 'F',
  AVOIR = 'A',
}

export enum OrdreType {
  COM = 'COM',
  ORD = 'ORD',
  ORI = 'ORI',
  REF = 'REF',
  REG = 'REG',
  REP = 'REP',
  RGP = 'RGP',
  RPF = 'RPF',
  RPO = 'RPO',
  RPR = 'RPR',
  UNK = 'UNK',
  UKT = 'UKT',
}

@ModelName('Ordre')
export class Ordre extends Model {

  @Field({ asKey: true }) public id?: string;
  @Field({ model: import('./societe.model') }) public societe?: Societe;
  @Field({ model: import('./devise.model') }) public devise?: Devise;
  @Field() public commentaireUsageInterne?: string;
  @Field({ model: import('./campagne.model') }) public campagne?: Campagne;
  @Field({ model: import('./secteur.model') }) public secteurCommercial?: Secteur;
  @Field({ model: import('./client.model') }) public client?: Client;
  @Field({ model: import('./ordre-ligne.model') }) public lignes?: OrdreLigne[];
  @Field({ model: import('./ordre-logistique.model') }) public logistiques?: OrdreLogistique[];
  @Field({ asLabel: true }) public numero?: string;
  @Field() public numeroFacture?: string;
  @Field() public referenceClient?: string;
  @Field({ model: import('./personne.model') }) public commercial?: Personne;
  @Field({ model: import('./personne.model') }) public assistante?: Personne;
  @Field({ model: import('./transporteur.model') }) public transporteur?: Transporteur;
  @Field({ model: import('./entrepot.model') }) public entrepot?: Entrepot;
  @Field({ dataType: 'localdate' }) public dateDepartPrevue?: string;
  @Field({ dataType: 'localdate' }) public dateLivraisonPrevue?: string;
  @Field() public venteACommission?: boolean;
  @Field() public bonAFacturer?: boolean;
  @Field() public facture?: boolean;
  @Field() public factureEDI?: boolean;
  @Field() public livre?: boolean;
  @Field() public instructionsLogistiques?: string;
  @Field() public codeClient?: string;
  @Field() public version?: string;
  @Field() public versionDetail?: string;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public factureAvoir?: FactureAvoir;
  @Field() public codeChargement?: string;
  @Field() public pourcentageMargeBrut?: number;
  @Field({ model: import('./type-camion.model') }) public typeTransport?: TypeCamion;
  @Field({format: {type: 'currency', precision: 2}, currency: 'EUR'})
  public prixUnitaireTarifTransport?: number;
  @Field() public transporteurDEVCode?: string;
  @Field({ model: import('./base-tarif.model') }) public baseTarifTransport?: BaseTarif;
  @Field({ dataType: 'localdate' }) public ETDDate?: string;
  @Field({ dataType: 'localdate' }) public ETADate?: string;
  @Field() public ETDLocation?: string;
  @Field() public ETALocation?: string;
  @Field({ model: import('./incoterm.model') }) public incoterm?: Incoterm;
  @Field() public incotermLieu?: string;
  @Field() public cqLignesCount?: number;
  @Field() public commentairesOrdreCount?: number;
  @Field() public hasLitige?: boolean;
  @Field() public codeAlphaEntrepot?: string;
  @Field({ dataType: 'datetime' }) public dateModification?: string;
  @Field({ dataType: 'datetime' }) public dateCreation?: string;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public type?: OrdreType;
  @Field({
    allowSorting: false,
    allowHeaderFiltering: false,
    allowSearch: false,
  }) public sommeColisCommandes?: number;
  @Field({
    allowSorting: false,
    allowHeaderFiltering: false,
    allowSearch: false,
  }) public sommeColisExpedies?: number;

}

export default Ordre;
