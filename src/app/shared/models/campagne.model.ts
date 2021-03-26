import {Field, Model, ModelName} from './model';

@ModelName('Campagne')
export class Campagne extends Model {
  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public description?: string;
  @Field({ dataType: 'date' }) public dateDebut?: string;
  @Field({ dataType: 'date' }) public dateFin?: string;
}

export default Campagne;
