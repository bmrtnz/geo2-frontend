import SupervisionPalox from './supervision-palox.model';
import { Field } from './model';

export class RecapitulatifFournisseur extends SupervisionPalox {
  @Field() numeroOrdre: string;
  @Field({ dataType: 'datetime' }) dateDepartOrdre: string;
  @Field() bonRetour: string;
  @Field() cmr: string;
  @Field() referenceClient: string;
  @Field() codeClient: string;
  @Field() nombrePaloxKO: number;
  @Field() nombrePaloxCause: number;
}

export default RecapitulatifFournisseur;
