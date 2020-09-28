import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { UtilisateursService } from './utilisateurs.service';
import { Utilisateur } from '../models/utilisateur.model';
import notify from 'devextreme/ui/notify';
import {Observable, Observer} from 'rxjs';

@Injectable()
export class AuthService {
  loggedIn = false;
  currentUser: Utilisateur;
  readonly LAST_USER_STORE_KEY = 'GEO2:LAST-USER';
  readonly CURRENT_USER_STORE_KEY = 'GEO2:CURRENT-USER';

  constructor(
    private router: Router,
    private utilisateursService: UtilisateursService,
  ) {
    const stored = window.localStorage.getItem(this.CURRENT_USER_STORE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.loggedIn = true;
      this.currentUser = parsed;
    }
  }

  logIn(id: string, password: string) {
    return new Observable((observer: Observer<void>) => {
      this.utilisateursService.getOne(id, password)
        .subscribe(res => {
          if (res.data.utilisateur) {
            this.loggedIn = true;
            this.currentUser = res.data.utilisateur;
            window.localStorage.setItem(this.CURRENT_USER_STORE_KEY, JSON.stringify(res.data.utilisateur));
            window.localStorage.setItem(this.LAST_USER_STORE_KEY, res.data.utilisateur.nomUtilisateur);
            this.router.navigate(['/']);
          } else {
            this.loggedIn = false;
            notify('Utilisateur et/ou mot de passe inconnu', 'error');
          }

          observer.next();
          observer.complete();
        });
    });
  }

  logOut() {
    this.loggedIn = false;
    window.localStorage.removeItem(this.CURRENT_USER_STORE_KEY);
    this.router.navigate(['/login']);
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
    constructor(private router: Router, private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot): boolean|UrlTree {
        const isLoggedIn = this.authService.isLoggedIn;
        const isLoginForm = route.routeConfig.path === 'login';

        if (isLoggedIn && isLoginForm) {
          return this.router.createUrlTree(['/']);
        }

        if (!isLoggedIn && !isLoginForm) {
            return this.router.createUrlTree(['/login']);
        }

        return isLoggedIn || isLoginForm;
    }
}
