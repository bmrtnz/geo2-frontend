import { Injectable, isDevMode } from "@angular/core";
import { Apollo } from "apollo-angular";
import { AuthService } from "..";
import { ApiService } from "../api.service";

type GQLResponse = {
    pClient: number; // pre-saisie
    mClient: number; // modification
    pFournisseur: number; // pre-saisie
    mFournisseur: number; // modification
    pTransporteur: number; // pre-saisie
    mTransporteur: number; // modification
    pLieuPassageAQuai: number; // pre-saisie
    mLieuPassageAQuai: number; // modification
    pEntrepot: number; // pre-saisie
    mEntrepot: number; // modification
    pArticle: number; // pre-saisie
};

type ConcatenatedResponse = {
    countClient: number;
    countFournisseur: number;
    countTransporteur: number;
    countLieuPassageAQuai: number;
    countEntrepot: number;
    countArticle: number;
};

@Injectable({
    providedIn: "root",
})
export class ValidationService extends ApiService {
    public prod = !isDevMode();

    private presaisieFilter = [
        ["preSaisie", "=", true],
        // 'and',
        // ['valide', '<>', true],
    ];

    private modificationFilter = [["modifications.statut", "=", false]];

    private countQuery = `
    query CountValidation(
      $searchPresaisie: String,
      $searchModif: String,
    ) {
      pClient: countClient(search: $searchPresaisie)
      mClient: countClient(search: $searchModif)
      pFournisseur: countFournisseur(search: $searchPresaisie)
      mFournisseur: countFournisseur(search: $searchModif)
      pTransporteur: countTransporteur(search: $searchPresaisie)
      mTransporteur: countTransporteur(search: $searchModif)
      pLieuPassageAQuai: countLieuPassageAQuai(search: $searchPresaisie)
      mLieuPassageAQuai: countLieuPassageAQuai(search: $searchModif)
      pEntrepot: countEntrepot(search: $searchPresaisie)
      mEntrepot: countEntrepot(search: $searchModif)
      pArticle: countArticle(search: $searchPresaisie)
    }
    `;

    constructor(private authService: AuthService, apollo: Apollo) {
        super(apollo);
    }

    /**
     * Fetch Tiers/Articles forms count with unvalidated status
     */
    public fetchUnvalidatedCount(): Promise<ConcatenatedResponse> {
        return new Promise((resolve) => {
            const searchPresaisie = this.mapDXFilterToRSQL(
                this.presaisieFilter,
            );
            const searchModif = this.mapDXFilterToRSQL(this.modificationFilter);

            this.listenQuery<GQLResponse>(
                this.countQuery,
                {
                    variables: { searchPresaisie, searchModif },
                    fetchPolicy: "no-cache",
                },
                (res) => resolve(this.concatResponse(res.data)),
            );
        });
    }

    public showToValidateBadges() {
        const tiersListe = [
            "Client",
            "Fournisseur",
            "Transporteur",
            "LieuPassageAQuai",
            "Entrepot",
        ];

        // Only showed when admin user (always shown when dev) - removed 12-20214
        // if (!this.authService.currentUser.adminClient && this.prod) return;

        this.fetchUnvalidatedCount().then((res) => {
            const counters = { ...res, countTiers: 0 };

            // Calculate unvalidated total tiers number
            Object.keys(counters).map((counter) => {
                if (tiersListe.includes(counter.replace("count", "")))
                    counters.countTiers += counters[counter];
            });

            // Show categories with unvalidated forms (red badge)
            Object.keys(counters).map((counter) => {
                const menuTitle = document.querySelector(
                    "." + counter + ".toValidate-indicator",
                );
                if (counters[counter]) {
                    menuTitle?.classList.remove("display-none");
                    if (menuTitle) menuTitle.innerHTML = counters[counter];
                } else {
                    menuTitle?.classList.add("display-none");
                }
            });
        });
    }

    private concatResponse(data: GQLResponse) {
        return {
            countClient: data.pClient,
            countFournisseur: data.pFournisseur,
            countTransporteur: data.pTransporteur,
            countLieuPassageAQuai: data.pLieuPassageAQuai,
            countEntrepot: data.pEntrepot,
            countArticle: data.pArticle,
        };
    }
}
