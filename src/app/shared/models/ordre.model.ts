import {Client} from './client.model';
import {Field, Model, ModelName} from './model';
import {OrdreLigne} from './ordre-ligne.model';
import Personne from './personne.model';
import {Secteur} from './secteur.model';
import {Societe} from './societe.model';
import Transporteur from './transporteur.model';

@ModelName('Ordre')
export class Ordre extends Model {

  @Field({ asKey: true }) public id?: string;
  @Field({ model: import('./societe.model') }) public societe?: Societe;
  @Field({ model: import('./secteur.model') }) public secteurCommercial?: Secteur;
  @Field({ model: import('./client.model') }) public client?: Client;
  @Field({ model: import('./ordre-ligne.model') }) public lignes?: OrdreLigne[];
  @Field({ asLabel: true }) public numero?: string;
  @Field() public referenceClient?: string;
  @Field({ model: import('./personne.model') }) public commercial?: Personne;
  @Field({ model: import('./personne.model') }) public assistante?: Personne;
  @Field({ model: import('./transporteur.model') }) public transporteur?: Transporteur;
  @Field({ dataType: 'date' }) public dateDepartPrevue?: string;
  @Field({ dataType: 'date' }) public dateLivraisonPrevue?: string;
  @Field() public venteACommission?: boolean;
  @Field() public bonAFacturer?: boolean;
  @Field() public facture?: boolean;
  @Field() public factureEDI?: boolean;
  @Field() public livre?: boolean;
  @Field() public instructionsLogistiques?: string;

}

export default Ordre;
