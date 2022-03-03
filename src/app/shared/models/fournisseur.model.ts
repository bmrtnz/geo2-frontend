import { BasePaiement } from "./base.paiement.model";
import { BureauAchat } from "./bureau-achat.model";
import CertificationFournisseur from "./certification-fournisseur.model";
import { ConditionVente } from "./condition-vente.model";
import { Devise } from "./devise.model";
import { GroupeFournisseur } from "./groupe-fournisseur.model";
import { Historique } from "./historique.model";
import IdentifiantFournisseur from "./identifiant.fournisseur.model";
import { Field, Model, ModelName } from "./model";
import { MoyenPaiement } from "./moyen-paiement.model";
import { Pays } from "./pays.model";
import { RegimeTva } from "./regime-tva.model";
import { Stock } from "./stock.model";
import { TypeTiers } from "./tier.model";
import { TypeFournisseur } from "./type.fournisseur.model";

export enum NatureStation {
    EXPEDITEUR_EMBALLEUR = "O",
    STATION_NORMAL = "N",
    EXCLUSIVEMENT_PROPRIETAIRE = "E",
    EXCLUSIVEMENT_EXPEDITEUR = "F",
}

@ModelName("Fournisseur")
export class Fournisseur extends Model {
    @Field({ asKey: true }) public id: string;
    @Field() public code: string;
    @Field({ model: import("./identifiant.fournisseur.model") })
    public identifiant: IdentifiantFournisseur;
    @Field({ asLabel: true }) public raisonSocial: string;
    @Field() public ville: string;
    @Field({ model: import("./pays.model") }) public pays: Pays;
    @Field({ model: import("./devise.model") }) public devise: Devise;
    @Field({ model: import("./pays.model") }) public langue: Pays;
    @Field() public valide: boolean;
    @Field() public preSaisie: boolean;
    @Field() public adresse1: string;
    @Field() public adresse2: string;
    @Field() public adresse3: string;
    @Field() public codePostal: string;
    @Field() public latitude: string;
    @Field() public longitude: string;
    @Field({ model: import("./moyen-paiement.model") })
    public moyenPaiement: MoyenPaiement;
    @Field({ model: import("./base.paiement.model") })
    public basePaiement: BasePaiement;
    @Field({ model: import("./regime-tva.model") }) public regimeTva: RegimeTva;
    @Field() public nbJourEcheance: number;
    @Field() public echeanceLe: number;
    @Field() public tvaCee: string;
    @Field({ model: import("./bureau-achat.model") })
    public bureauAchat: BureauAchat;
    @Field() public margeObjectifEuroKilo: number;
    @Field() public margeObjectifPourcentCa: number;
    @Field() public stockActif: boolean;
    @Field() public stockPrecalibre: boolean;
    @Field({ model: import("./type.fournisseur.model") })
    public type: TypeFournisseur;
    @Field() public listeSocietes: string;
    @Field() public idTracabilite: string;
    @Field() public agrementBW: string;
    @Field() public codeStation: string;
    @Field() public compteComptable: string;
    @Field() public lieuFonctionEan: string;
    @Field() public declarantCHEP: boolean;
    @Field() public formeJuridique: string;
    @Field() public siretAPE: string;
    @Field() public rcs: string;
    @Field() public suiviDestockage: boolean;
    @Field({ allowHeaderFiltering: false, allowSearch: false })
    public natureStation: NatureStation; // API = ENUM
    @Field() public referenceIfco: string;
    @Field({ dataType: "date" }) public dateDebutIfco: string;
    @Field() public consignePaloxSa: boolean;
    @Field() public consignePaloxUdc: boolean;
    @Field() public listeExpediteurs: string;
    @Field({ allowHeaderFiltering: false, allowSearch: false })
    public typeTiers: TypeTiers;
    @Field() public autoFacturation: boolean;
    @Field() public tvaId: string;
    @Field({ model: import("./historique.model") })
    public historique: Historique[];
    @Field() public indicateurModificationDetail: boolean;
    @Field({ dataType: "date" })
    public dateConditionGeneraleAchatSignee: string;
    @Field() public declarantBacsCHEP: boolean;
    @Field({ model: import("./condition-vente.model") })
    public conditionVente: ConditionVente;
    @Field({
        model: import("./fournisseur.model"),
        allowHeaderFiltering: false,
        allowSearch: false,
    })
    public fournisseurDeRattachement: Fournisseur;
    @Field({ model: import("./groupe-fournisseur.model") })
    public groupeFournisseur: GroupeFournisseur;
    @Field({
        model: import("./certification-fournisseur.model"),
        allowSearch: false,
    })
    public certifications: CertificationFournisseur[];
    @Field({ model: import("./stock.model") }) public stocks: Stock[];
}

export default Fournisseur;
