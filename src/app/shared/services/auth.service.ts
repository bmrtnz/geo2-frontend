import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import notify from 'devextreme/ui/notify';
import { concatMap, take, tap } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateursService } from './api/utilisateurs.service';
import { CurrentCompanyService } from './current-company.service';

const SKIP_LOCATION_CHANGE = true;

@Injectable()
export class AuthService {

  private loggedIn = false;
  public currentUser: Utilisateur;

  readonly LAST_USER_STORE_KEY = 'GEO2:LAST-USER';
  readonly CURRENT_USER_STORE_KEY = 'GEO2:CURRENT-USER';
  readonly USER_FIELDS = [

    // Identité
    'nomUtilisateur',
    'nomInterne',
    'perimetre',
    'limitationSecteur',
    'secteurCommercial.id',
    'secteurCommercial.description',
    'commercial.id',
    'assistante.id',
    'personne.id',
    'personne.role',

    // Sécurité / Droits
    'accessGeoTiers',
    'accessGeoProduct',
    'accessGeoOrdre',
    'adminClient',
    'profileClient',

    // Configurations
    'configTuilesOrdres',
    'configTabsOrdres',

  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilisateursService: UtilisateursService,
    public currentCompanyService: CurrentCompanyService
  ) {
    const stored = window.localStorage.getItem(this.CURRENT_USER_STORE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.loggedIn = true;
      this.setCurrentUser(parsed);
    }
  }

  logIn(id: string, password: string) {
    return this.utilisateursService
    .getOne(id, password, this.USER_FIELDS, { fetchPolicy: 'network-only' })
    .pipe(
      concatMap(res => {
        this.setCurrentUser(res.data.utilisateur);
        window.localStorage.setItem(this.LAST_USER_STORE_KEY, res.data.utilisateur.nomUtilisateur);
        this.loggedIn = true;

        // Handle redirection
        const redirectionURL = this.activatedRoute.snapshot.queryParams?.redirect;
        return this.router.navigateByUrl(redirectionURL ?? '/');
      }),
    );
  }

  showWelcome() {
    const name = this.currentUser.nomUtilisateur;
    const mess = 'Bienvenue ' + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + ' !';
    notify({ message: mess, elementAttr: {class : 'welcome-message'} }, 'info');
  }

  loginError() {
    this.loggedIn = false;
    notify('Utilisateur et/ou mot de passe inconnu', 'error');
  }

  persist(data: Partial<Utilisateur>) {
    return this.utilisateursService
    .save_v2(this.USER_FIELDS, {
      utilisateur: {
        nomUtilisateur: this.currentUser.nomUtilisateur,
        ...data,
      }
    }).pipe(
      take(1),
      tap( res => this.setCurrentUser(res.data.saveUtilisateur)),
    );
  }

  setCurrentUser(data: Partial<Utilisateur>) {
    this.currentUser = new Utilisateur({ ...this.currentUser, ...data });
    window.localStorage
    .setItem(this.CURRENT_USER_STORE_KEY, JSON.stringify(this.currentUser));
  }

  async logOut() {
    if (this.router.isActive('/login', false)) return;
    this.loggedIn = false;
    window.localStorage.removeItem(this.CURRENT_USER_STORE_KEY);
    return this.router.navigate(['/login'], {
      skipLocationChange: SKIP_LOCATION_CHANGE,
      queryParamsHandling: 'merge',
      queryParams: { redirect: this.router.url },
    });
  }

  get isLoggedIn() {
    return this.loggedIn;
  }

  get lastUsername() {
    return window.localStorage.getItem(this.LAST_USER_STORE_KEY) || '';
  }

  get isAdmin() {
    return this.currentUser.profileClient === 'ADMIN';
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedIn;
    const isLoginRoute = route.routeConfig.path === 'login';

    if (!isLoggedIn && !isLoginRoute)
      return this.router.createUrlTree(['/login'], {
        skipLocationChange: SKIP_LOCATION_CHANGE,
        queryParamsHandling: 'merge',
        queryParams: { redirect: state.url },
      });

    return isLoggedIn || isLoginRoute;
  }
}
