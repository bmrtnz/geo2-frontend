import { Field, Model, ModelName } from "./model";

@ModelName("Transitaire")
export class Transitaire extends Model {
  @Field({ asKey: true }) public id: string;
  @Field({ asLabel: true }) public raisonSocial: string;
  @Field() public valide: boolean;
  @Field() public declarantDouanier: boolean;
  get codePlus() {
    return `${this.id} - ${this.raisonSocial}`;
  }
}

export default Transitaire;
