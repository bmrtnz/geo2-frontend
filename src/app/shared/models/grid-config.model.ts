import { Model, Field } from './model';
import { Utilisateur } from './utilisateur';

export class GridConfig extends Model {

  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public grid: string;
  @Field({model: Utilisateur}) public utilisateur: Utilisateur;
  @Field() public config: {};

}
