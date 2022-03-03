import { Client } from "./client.model";
import { TypeTiers } from "./tier.model";
import { Field, Model, ModelName } from "./model";
import { Pays } from "./pays.model";
import { RegimeTva } from "./regime-tva.model";
import { MoyenPaiement } from "./moyen-paiement.model";
import { BasePaiement } from "./base.paiement.model";
import { Devise } from "./devise.model";

@ModelName("Transporteur")
export class Transporteur extends Model {
    @Field({ asKey: true }) public id: string;
    @Field({ asLabel: true }) public raisonSocial: string;
    @Field() public ville: string;
    @Field({ model: import("./pays.model") }) public pays: Pays;
    @Field() public codePostal: string;
    @Field() public adresse1: string;
    @Field() public valide: boolean;
    @Field() public preSaisie: boolean;
    @Field() public adresse2: string;
    @Field() public adresse3: string;
    @Field({ model: import("./regime-tva.model") }) public regimeTva: RegimeTva;
    @Field() public nbJourEcheance: number;
    @Field() public echeanceLe: number;
    @Field({ model: import("./moyen-paiement.model") })
    public moyenPaiement: MoyenPaiement;
    @Field() public tvaCee: string;
    @Field({ model: import("./base.paiement.model") })
    public basePaiement: BasePaiement;
    @Field() public compteComptable: string;
    @Field({ model: import("./pays.model") }) public langue: Pays;
    @Field({ model: import("./devise.model") }) public devise: Devise;
    @Field() public lieuFonctionEan: string;
    @Field({ model: import("./client.model") })
    public clientRaisonSocial: Client;
    @Field({ allowHeaderFiltering: false, allowSearch: false })
    public typeTiers: TypeTiers;
}

export default Transporteur;
