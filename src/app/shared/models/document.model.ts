import {Field, Model, ModelName} from './model';

@ModelName('Document')
export class Document extends Model {
  @Field({asKey: true}) public isPresent: boolean;
  @Field({asLabel: true}) public filename: string;
}

export default Document;
