export class Personne {

  public id: string;
  public prenom: string;
  public nom: string;
  public service: string;
  public nomUtilisateur: string;
  public imprimante: string;
  public email: string;
  public valide: boolean;

  public nomPrenom() {
    return `${this.nom} ${this.prenom}`;
  }

}
