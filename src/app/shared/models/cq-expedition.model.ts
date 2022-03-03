import { Field, Model, ModelName } from "./model";

@ModelName("CQExpedition")
export class CQExpedition extends Model {
    @Field({ asKey: true }) public id?: string;
    // @Field({asLabel: true}) public typePaletteOK?: boolean;
}

export default CQExpedition;
