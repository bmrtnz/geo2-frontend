import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import notify from "devextreme/ui/notify";
import { Subject } from "rxjs";
import { concatMap, take, tap } from "rxjs/operators";
import { Utilisateur } from "../models/utilisateur.model";
import { UtilisateursService } from "./api/utilisateurs.service";
import { CurrentCompanyService } from "./current-company.service";
import dxDataGrid from "devextreme/ui/data_grid";

@Injectable()
export class AuthService {
  private loggedIn = false;
  public currentUser: Utilisateur;
  private userChange = new Subject<void>();

  readonly LAST_USER_STORE_KEY = "GEO2:LAST-USER";
  readonly CURRENT_USER_STORE_KEY = "GEO2:CURRENT-USER";
  readonly USER_FIELDS = [
    // Identité
    "nomUtilisateur",
    "nomInterne",
    "perimetre",
    "limitationSecteur",
    "secteurCommercial.id",
    "secteurCommercial.description",
    "commercial.id",
    "assistante.id",
    "personne.id",
    "personne.role",
    "email",

    // Sécurité / Droits
    "accessGeoTiers",
    "accessGeoProduct",
    "accessGeoOrdre",
    "accessCommandeEdi",
    "adminClient",
    "profileClient",
    "geoClient",

    // Configurations
    "configTuilesOrdres",
    "configTabsOrdres",
    "periode",
    "filtreRechercheStockEdi",
    "reportProprietaire",
    "reportExpediteur",
    "reportPrixAchat",
    "reportPrixVente",
    "reportTypePalette",
    "barreDefilementHaut",
    "barreDefilementVisible",
    "diffSurExpedition",

    // Autres accès
    "indicateurVisualisationIncotermFournisseur",
    "commentaireStock",
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilisateursService: UtilisateursService,
    public currentCompanyService: CurrentCompanyService
  ) {
    const stored = window.sessionStorage.getItem(this.CURRENT_USER_STORE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.loggedIn = true;
      this.setCurrentUser(parsed);
    }
  }

  logIn(id: string, password: string, redirection = "/") {
    return this.utilisateursService
      .getOne(id, password, this.USER_FIELDS, {
        fetchPolicy: "no-cache",
      })
      .pipe(
        concatMap((res) => {
          this.logUser(res.data.utilisateur);
          return this.router.navigateByUrl(redirection);
        })
      );
  }

  public logUser(user: Utilisateur) {
    this.setCurrentUser(user);
    window.localStorage.setItem(this.LAST_USER_STORE_KEY, user.nomUtilisateur);
    this.loggedIn = true;
  }

  showWelcome() {
    const name = this.currentUser.nomUtilisateur;
    const mess =
      "Bienvenue " +
      name.charAt(0).toUpperCase() +
      name.slice(1).toLowerCase() +
      " !";
    notify(mess);
  }

  loginError() {
    this.loggedIn = false;
    notify("Utilisateur et/ou mot de passe inconnu", "error");
  }

  persist(data: Partial<Utilisateur>) {
    return this.utilisateursService
      .save_v2(this.USER_FIELDS, {
        utilisateur: {
          nomUtilisateur: this.currentUser.nomUtilisateur,
          ...data,
        },
      })
      .pipe(
        take(1),
        tap((res) => this.setCurrentUser(res.data.saveUtilisateur))
      );
  }

  setCurrentUser(data: Partial<Utilisateur>) {
    this.currentUser = new Utilisateur({ ...this.currentUser, ...data });
    window.sessionStorage.setItem(
      this.CURRENT_USER_STORE_KEY,
      JSON.stringify(this.currentUser)
    );
    this.userChange.next();
    this.applySpecificParameters(this.currentUser);
  }

  applySpecificParameters(utilisateur) {
    // Horiz Scrollbar position
    document.documentElement.style.setProperty(
      '--pos-scrollbar',
      utilisateur.barreDefilementHaut ? "0" : "auto"
    );
    document.documentElement.style.setProperty(
      '--margin-pos-scrollbar',
      utilisateur.barreDefilementHaut ? "-2px" : "-9px"
    );
    document.documentElement.style.setProperty(
      '--padding-pos-scrollbar',
      !utilisateur.barreDefilementHaut && utilisateur.barreDefilementVisible ? "10px" : "0"
    );
    // Fixed horiz scrollbar
    dxDataGrid.defaultOptions({
      options: {
        scrolling: { useNative: false, showScrollbar: utilisateur.barreDefilementVisible ? 'always' : 'onHover' },
      }
    });
  }

  logOut() {
    this.loggedIn = false;
    window.sessionStorage.removeItem(this.CURRENT_USER_STORE_KEY);
    if (!this.router.isActive("/profile/login", false))
      return this.router.navigateByUrl(
        this.createLoginRedirectURLTree(this.router.url)
      );
  }

  public createLoginRedirectURLTree(redirect: string) {
    return this.router.createUrlTree(["/profile/login"], {
      /* Removed unsupported properties by Angular migration: skipLocationChange. */
      queryParamsHandling: "merge",
      queryParams: { redirect },
    });
  }

  get isLoggedIn() {
    return this.loggedIn;
  }

  get lastUsername() {
    return window.localStorage.getItem(this.LAST_USER_STORE_KEY) || "";
  }

  get isAdmin() {
    return this.currentUser.profileClient === "ADMIN";
  }

  onUserChanged() {
    return this.userChange.asObservable();
  }

}
