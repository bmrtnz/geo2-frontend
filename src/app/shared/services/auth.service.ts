import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import notify from 'devextreme/ui/notify';
import { from, throwError } from 'rxjs';
import { catchError, mergeAll, switchMap, take, tap } from 'rxjs/operators';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateursService } from './api/utilisateurs.service';
import { CurrentCompanyService } from './current-company.service';

@Injectable()
export class AuthService {

  private loggedIn = false;
  public currentUser: Utilisateur;

  readonly LAST_USER_STORE_KEY = 'GEO2:LAST-USER';
  readonly CURRENT_USER_STORE_KEY = 'GEO2:CURRENT-USER';

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
      this.currentUser = parsed;
    }
  }

  logIn(id: string, password: string) {
    return from(this.utilisateursService.getOne(id, password))
      .pipe(
        mergeAll(),
        take(1),
        switchMap(res => {
          if (res.data.utilisateur) {
            this.setCurrentUser(res.data.utilisateur);
            window.localStorage.setItem(this.LAST_USER_STORE_KEY, res.data.utilisateur.nomUtilisateur);
            this.loggedIn = true;

            // Handle redirection
            const redirectionURL = this.activatedRoute.snapshot.queryParams?.redirect;
            return this.router.navigateByUrl(redirectionURL ?? '/');
          } else {
            this.loginError();
          }
        }),
        catchError((e: any) => {
          this.loginError();

          return throwError(e);
        }),
        tap( _ => this.showWelcome()),
      );
  }

  private showWelcome() {
    const name = this.currentUser.nomUtilisateur;
    const mess = 'Bienvenue ' + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + ' !';
    notify({ message: mess, elementAttr: {class : 'welcome-message'} }, 'info');
  }

  private loginError() {
    this.loggedIn = false;
    notify('Utilisateur et/ou mot de passe inconnu', 'error');
  }

  persist(data: Partial<Utilisateur>) {
    return this.utilisateursService
    .save({
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
    this.currentUser = { ...this.currentUser, ...data };
    window.localStorage
    .setItem(this.CURRENT_USER_STORE_KEY, JSON.stringify(this.currentUser));
  }

  async logOut() {
    this.loggedIn = false;
    window.localStorage.removeItem(this.CURRENT_USER_STORE_KEY);
    await this.router.navigate(['/login'], {
      skipLocationChange: true,
      queryParamsHandling: 'merge',
      queryParams: { redirect: this.router.url },
    });
    // TODO Extends BaseRouteReuseStrategy(v10) to not reload route from cache on redirect, fixing with location.reload() for now
    window.location.reload();
  }

  get isLoggedIn() {
    return this.loggedIn;
  }

  get lastUsername() {
    return window.localStorage.getItem(this.LAST_USER_STORE_KEY) || '';
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
        skipLocationChange: true,
        queryParamsHandling: 'merge',
        queryParams: { redirect: state.url },
      });

    return isLoggedIn || isLoginRoute;
  }
}
