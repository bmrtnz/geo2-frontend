import {Societe} from './societe';
import {Secteur} from './secteur';
import {Pays} from './pays';

export class Client {

  public id: string;
  public code: string;
  public raisonSocial: string;
  public societe: Societe;
  public secteur: Secteur;
  public adresse1: string;
  public adresse2: string;
  public adresse3: string;
  public codePostal: string;
  public ville: string;
  public pays: Pays;
  public facturationRaisonSocial: string;
  public facturationAdresse1: string;
  public facturationAdresse2: string;
  public facturationAdresse3: string;
  public facturationCodePostal: string;
  public facturationVille: string;
  public facturationPays: Pays;

}
