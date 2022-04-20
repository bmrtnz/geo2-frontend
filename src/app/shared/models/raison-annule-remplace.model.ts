import { Field, Model, ModelName } from "./model";

@ModelName("RaisonAnnuleRemplace")
export class RaisonAnnuleRemplace extends Model {
    @Field({ asKey: true }) public description?: string;
}

export default RaisonAnnuleRemplace;
