import SupervisionPalox from './supervision-palox.model';
import { Field } from './model';

export class MouvementFournisseur extends SupervisionPalox {
  @Field() numeroOrdre: string;
  @Field({ dataType: 'datetime' }) dateDepartOrdre: string;
  @Field() entree: number;
  @Field() sortie: number;
  @Field() bonRetour: string;
  @Field() cmr: string;
  @Field() referenceClient: string;
  @Field() codeClient: string;
  @Field() nombrePaloxKO: number;
  @Field() nombrePaloxCause: number;
}

export default MouvementFournisseur;
