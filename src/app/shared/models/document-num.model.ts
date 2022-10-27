import Document from "./document.model";
import { Field, Model, ModelName } from "./model";
import OrdreLigne from "./ordre-ligne.model";

@ModelName("DocumentNum")
export class DocumentNum extends Model {

  @Field({ asKey: true })
  ordreNumero: string;

  @Field({ asKey: true })
  typeDocument: string;

  @Field({ asKey: true })
  anneeCreation: string;

  @Field()
  moisCreation: string;

  @Field()
  nomPartage: string;

  @Field()
  id: string;

  @Field()
  numeroOrdre: string;

  @Field({ model: import("./ordre-ligne.model") })
  ordreLigne: Partial<OrdreLigne>;

  @Field()
  nomFichier: string;

  @Field()
  nomFichierComplet: string;

  @Field()
  commentaire: string;

  @Field()
  flagPDF: boolean;

  @Field()
  statut: number;

  @Field({ model: import("./document.model") })
  cqPhoto: Document;
}

export default DocumentNum;
