import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RootComponent } from 'app/pages/ordres/root/root.component';
import { iif, Observable, of } from 'rxjs';
import { AuthService } from '../services';

@Injectable()
export class OrdresTabsPersistGuard implements CanActivate, CanDeactivate<RootComponent> {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  /**
   * Entering/Restore tabs config
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return iif(
      () => !!this.authService.currentUser.configTabsOrdres,
      of(this.router.parseUrl(this.authService.currentUser.configTabsOrdres)),
      of(this.router.createUrlTree(['/ordres/home'])),
    );
  }

  /**
   * Quitting/Save tabs config
   */
  canDeactivate(
    component: RootComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

      // Don't block navigation during save
      if (!nextState.url.startsWith('/ordres'))
        this.authService.persist({
          configTabsOrdres: encodeURI(currentState.url),
        }).toPromise();

      return true;
  }

}
