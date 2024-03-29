import { Field, Model, ModelName } from "./model";
import Secteur from "./secteur.model";
import Personne from "./personne.model";
import ParamUserClientRestrictionModel from "./param-user-client-restriction.model";

@ModelName("Utilisateur")
export class Utilisateur extends Model {
  @Field({ asKey: true }) public nomUtilisateur?: string;
  @Field() public nomInterne?: string;
  @Field() public accessGeoTiers?: boolean;
  @Field() public accessGeoProduct?: boolean;
  @Field() public accessGeoOrdre?: boolean;
  @Field() public accessCommandeEdi?: boolean;
  @Field({ model: import("./param-user-client-restriction.model") })
  @Field()
  public restrictions?: ParamUserClientRestrictionModel[];
  @Field() public perimetre?: string;
  @Field() public geoClient?: string;
  @Field() public limitationSecteur?: boolean;
  @Field({ model: import("./secteur.model") })
  @Field()
  public indicateurVisualisationIncotermFournisseur?: boolean;
  @Field() public secteurCommercial?: Secteur;
  @Field({ model: import("./personne.model") }) public commercial?: Personne;
  @Field({ model: import("./personne.model") }) public assistante?: Personne;
  @Field({ model: import("./personne.model") }) public personne?: Personne;
  @Field() public configTuilesOrdres?: any;
  @Field() public configTabsOrdres?: { [key: string]: string };
  @Field() public adminClient?: boolean;
  @Field() public profileClient?: string;
  @Field() public email?: string;
  @Field() public periode?: string;
  @Field() public commentaireStock?: boolean;
  @Field() public filtreRechercheStockEdi?: "S" | "D";
  @Field() public reportExpediteur?: boolean;
  @Field() public reportPrixAchat?: boolean;
  @Field() public reportPrixVente?: boolean;
  @Field() public reportProprietaire?: boolean;
  @Field() public reportTypePalette?: boolean;
  @Field() public barreDefilementHaut?: boolean;
  @Field() public barreDefilementVisible?: boolean;
  @Field() public diffSurExpedition?: boolean;

  public getSUP?() {
    return (
      [this?.commercial, this?.assistante]
        .filter((person) => person?.indicateurPresentationSUP)
        .map((person) => person.indicateurPresentationSUP)[0] ?? null
    );
  }
}

export default Utilisateur;
