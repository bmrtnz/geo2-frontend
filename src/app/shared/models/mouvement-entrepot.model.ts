import SupervisionPalox from './supervision-palox.model';
import { Field } from './model';

export class MouvementEntrepot extends SupervisionPalox {
  @Field() numeroOrdre: string;
  @Field({ dataType: 'datetime' }) dateDepartOrdre: string;
  @Field() bonRetour: string;
  @Field() cmr: string;
  @Field() referenceClient: string;
  @Field() codeClient: string;
  @Field() nombrePaloxKO: number;
  @Field() nombrePaloxCause: number;
  @Field() station: string;
}

export default MouvementEntrepot;
