import {Field, Model, ModelName} from './model';

@ModelName('Document')
export class Document extends Model {
  @Field({asKey: true}) public isPresent: boolean;
  @Field({asLabel: true}) public uri: string;
  @Field({asLabel: true}) public type: string;
}

export default Document;
