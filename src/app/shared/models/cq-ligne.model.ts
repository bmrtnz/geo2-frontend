import CQExpedition from './cq-expedition.model';
import Fournisseur from './fournisseur.model';
import { Field, Model, ModelName } from './model';
import OrdreLigne from './ordre-ligne.model';
import Ordre from './ordre.model';
import TypePalette from './type-palette.model';

export enum CahierDesCharges {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

@ModelName('CQLigne')
export class CQLigne extends Model {
  @Field({asKey: true}) public id?: string;
  @Field() public isExp?: number;
  @Field() public codePaletteEffectif?: string;
  @Field() public nombreColis?: number;
  @Field() public poidsNetTheoriqueParColis?: number;
  @Field({model: import('./fournisseur.model')}) public fournisseur?: Fournisseur;
  @Field() public articleDescription?: string;
  @Field() public articleDescriptionAbrege?: string;
  @Field() public commentairesControleur?: string;
  @Field({model: import('./cq-expedition.model')}) public expedition?: CQExpedition;
  @Field({model: import('./ordre.model')}) public ordre?: Ordre;
  @Field({model: import('./type-palette.model')}) public typePalette?: TypePalette;
  @Field({model: import('./ordre-ligne.model')}) public ordreLigne?: OrdreLigne;
  @Field({allowHeaderFiltering: false, allowSearch: false}) public cahierDesCharges?: CahierDesCharges;
  @Field() public referenceCQC?: string;
  @Field() public nombreFruitsTheoriqueParColis?: number;
  @Field() public lotConforme?: boolean;
  @Field() public colisConforme?: boolean;
  @Field() public corniereConforme?: boolean;
  @Field() public feuillardConforme?: boolean;
  @Field() public normalisationEAN128?: boolean;
  @Field() public codeTracabilite?: boolean;
  @Field() public codeBarreClient?: boolean;
  @Field() public nonConformeTri?: boolean;
  @Field() public nonConformeAutreClient?: boolean;
  @Field() public nonConformeDerogationInterne?: boolean;
  @Field() public nomResponsableDerogationInterne?: string;
  @Field() public causeNonConformite?: string;
  @Field() public nombrePalettesTri?: number;
  @Field() public nombrePalettes?: number;
  @Field() public nombrePalettesFournisseur?: number;
  @Field() public accepteApresAccordClient?: boolean;
  @Field() public evalue?: boolean;
  @Field({ dataType: 'datetime' }) public dateFinControle?: string;
  @Field({ dataType: 'datetime' }) public dateDerniereSaisieOffline?: string;
  @Field() public utilisateurDerniereSaisieOffline?: string;
  @Field() public machineDerniereSaisieOffline?: string;
  @Field() public utilisateurEnCharge?: string;
  @Field() public ordreDescription?: string;
  @Field() public articleReference?: string;
  @Field() public nombreColisControles?: number;
}

export default CQLigne;
