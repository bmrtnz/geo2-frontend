import { Field, Model } from './model';

export class PlanningTransporteur extends Model {
  @Field({ asKey: true }) id: number;
  @Field() codeChargement: string;
  @Field() numero: string;
  @Field({ dataType: 'localdate' }) dateLivraisonPrevue: string;
  @Field() referenceClient: string;
  @Field() version: string;
  @Field() sommeColisCommandes: number;
  @Field() sommeColisPalette: number;
  @Field() sommeColisPaletteBis: number;
  @Field() entrepot: string;
  @Field() entrepotRaisonSocial: string;
  @Field() entrepotCodePostal: string;
  @Field() entrepotVille: string;
  @Field() entrepotPays: string;
  @Field({ dataType: 'datetime' }) dateDepartPrevueFournisseur: string;
  @Field() fournisseur: string;
  @Field() fournisseurCodePostal: string;
  @Field() fournisseurPays: string;
  @Field({ dataType: 'datetime' }) dateDepartPrevueGroupage: string;
  @Field() groupage: string;
  @Field() espece: string;
  @Field() palette: string;
  @Field() transporteur: string;
  @Field() flagEntrepot: boolean;
  @Field() colis: string;
}

export default PlanningTransporteur;
